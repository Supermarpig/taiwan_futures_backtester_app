import { 
  BacktestSettings, 
  BacktestResult, 
  Trade, 
  Order, 
  OrderType, 
  OrderStatus, 
  TradeDirection, 
  Position, 
  EquityPoint,
  DrawdownPoint,
  Performance
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { MarketData } from '../api/yahooFinance';

/**
 * 回測引擎類
 * 負責執行回測、處理訂單、管理倉位和計算績效
 */
export class BacktestEngine {
  private settings: BacktestSettings;
  private marketData: MarketData;
  private currentIndex: number = 0;
  private currentTime: number = 0;
  private cash: number = 0;
  private equity: number[] = [];
  private positions: Map<string, Position> = new Map();
  private orders: Order[] = [];
  private trades: Trade[] = [];
  private equityCurve: EquityPoint[] = [];
  private drawdownCurve: DrawdownPoint[] = [];
  private highWaterMark: number = 0;

  /**
   * 建立回測引擎實例
   * @param settings 回測設置
   * @param marketData 市場數據
   */
  constructor(settings: BacktestSettings, marketData: MarketData) {
    this.settings = settings;
    this.marketData = marketData;
    this.cash = settings.initialCapital;
    this.equity.push(settings.initialCapital);
    this.highWaterMark = settings.initialCapital;
  }

  /**
   * 執行回測
   * @param generateSignals 信號生成函數，根據策略產生交易信號
   * @returns 回測結果
   */
  public run(generateSignals: (data: MarketData, index: number, params: any) => TradeDirection): BacktestResult {
    // 找到開始和結束日期對應的索引
    const startIndex = this.findDateIndex(this.settings.startDate);
    const endIndex = this.findDateIndex(this.settings.endDate);
    
    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
      throw new Error('無效的回測日期範圍');
    }

    // 遍歷每個交易日
    for (let i = startIndex; i <= endIndex; i++) {
      this.currentIndex = i;
      this.currentTime = this.marketData.timestamp[i];
      
      // 根據策略生成交易信號
      const signal = generateSignals(this.marketData, i, this.settings.strategyParams);
      
      // 處理交易信號
      this.processSignal(signal);
      
      // 更新倉位和權益
      this.updatePositions();
      
      // 記錄權益曲線
      this.recordEquity();
    }

    // 平倉所有倉位
    this.closeAllPositions();
    
    // 計算績效指標
    const performance = this.calculatePerformance();
    
    // 返回回測結果
    return {
      id: uuidv4(),
      settings: this.settings,
      trades: this.trades,
      performance,
      equity: this.equityCurve,
      drawdowns: this.drawdownCurve
    };
  }

  /**
   * 處理交易信號
   * @param signal 交易信號
   */
  private processSignal(signal: TradeDirection): void {
    const currentPosition = this.getPosition(this.settings.symbol);
    const currentDirection = currentPosition ? currentPosition.direction : TradeDirection.NONE;
    
    // 如果信號與當前倉位方向相同，不做任何操作
    if (signal === currentDirection) {
      return;
    }
    
    // 如果有倉位且信號不同，平倉
    if (currentDirection !== TradeDirection.NONE) {
      this.closePosition(this.settings.symbol);
    }
    
    // 如果信號不是NONE，開新倉
    if (signal !== TradeDirection.NONE) {
      this.openPosition(this.settings.symbol, signal);
    }
  }

  /**
   * 開倉
   * @param symbol 交易標的
   * @param direction 交易方向
   */
  private openPosition(symbol: string, direction: TradeDirection): void {
    const price = this.getCurrentPrice();
    const positionValue = this.cash * (this.settings.positionSize / 100);
    const quantity = Math.floor(positionValue / price);
    
    if (quantity <= 0) {
      return; // 資金不足
    }
    
    // 創建市價單
    const order: Order = {
      id: uuidv4(),
      symbol,
      type: OrderType.MARKET,
      direction,
      quantity,
      status: OrderStatus.PENDING,
      createdAt: this.currentTime,
      commission: 0,
      slippage: 0
    };
    
    // 執行訂單
    this.executeOrder(order);
  }

  /**
   * 平倉
   * @param symbol 交易標的
   */
  private closePosition(symbol: string): void {
    const position = this.getPosition(symbol);
    
    if (!position) {
      return;
    }
    
    // 創建平倉市價單
    const order: Order = {
      id: uuidv4(),
      symbol,
      type: OrderType.MARKET,
      direction: position.direction === TradeDirection.LONG ? TradeDirection.SHORT : TradeDirection.LONG,
      quantity: position.quantity,
      status: OrderStatus.PENDING,
      createdAt: this.currentTime,
      commission: 0,
      slippage: 0
    };
    
    // 執行訂單
    this.executeOrder(order);
  }

  /**
   * 執行訂單
   * @param order 訂單
   */
  private executeOrder(order: Order): void {
    const price = this.getCurrentPrice();
    const slippageAmount = price * (this.settings.slippage / 100);
    const executionPrice = order.direction === TradeDirection.LONG 
      ? price + slippageAmount  // 做多時，滑點使價格上升
      : price - slippageAmount; // 做空時，滑點使價格下降
    
    const commissionAmount = executionPrice * order.quantity * (this.settings.commissionRate / 100);
    
    // 更新訂單狀態
    order.status = OrderStatus.FILLED;
    order.filledAt = this.currentTime;
    order.filledPrice = executionPrice;
    order.commission = commissionAmount;
    order.slippage = slippageAmount * order.quantity;
    
    this.orders.push(order);
    
    // 更新倉位
    this.updatePositionFromOrder(order);
    
    // 更新資金
    const orderValue = executionPrice * order.quantity;
    const totalCost = orderValue + commissionAmount;
    
    if (order.direction === TradeDirection.LONG) {
      this.cash -= totalCost;
    } else {
      this.cash += orderValue - commissionAmount;
    }
    
    // 檢查是否完成一筆交易（開倉後平倉）
    this.checkCompleteTrade(order);
  }

  /**
   * 根據訂單更新倉位
   * @param order 訂單
   */
  private updatePositionFromOrder(order: Order): void {
    const position = this.getPosition(order.symbol);
    
    // 如果是開倉
    if (!position || position.direction !== order.direction) {
      const newPosition: Position = {
        symbol: order.symbol,
        direction: order.direction,
        quantity: order.quantity,
        entryPrice: order.filledPrice!,
        entryTime: order.filledAt!,
        lastUpdateTime: order.filledAt!,
        unrealizedPnl: 0
      };
      
      this.positions.set(order.symbol, newPosition);
    } 
    // 如果是加倉
    else {
      const totalValue = position.entryPrice * position.quantity + order.filledPrice! * order.quantity;
      const totalQuantity = position.quantity + order.quantity;
      
      position.entryPrice = totalValue / totalQuantity;
      position.quantity = totalQuantity;
      position.lastUpdateTime = order.filledAt!;
    }
  }

  /**
   * 檢查是否完成一筆交易（開倉後平倉）
   * @param order 訂單
   */
  private checkCompleteTrade(order: Order): void {
    // 找到與當前訂單方向相反的最近訂單
    const oppositeOrders = this.orders.filter(o => 
      o.symbol === order.symbol && 
      o.direction !== order.direction &&
      o.status === OrderStatus.FILLED
    );
    
    if (oppositeOrders.length === 0) {
      return;
    }
    
    const oppositeOrder = oppositeOrders[oppositeOrders.length - 1];
    
    // 確定哪個是入場訂單，哪個是出場訂單
    let entryOrder, exitOrder;
    if (oppositeOrder.filledAt! < order.filledAt!) {
      entryOrder = oppositeOrder;
      exitOrder = order;
    } else {
      entryOrder = order;
      exitOrder = oppositeOrder;
    }
    
    // 計算盈虧
    const isLong = entryOrder.direction === TradeDirection.LONG;
    const entryPrice = entryOrder.filledPrice!;
    const exitPrice = exitOrder.filledPrice!;
    const quantity = Math.min(entryOrder.quantity, exitOrder.quantity);
    
    const profit = isLong 
      ? (exitPrice - entryPrice) * quantity
      : (entryPrice - exitPrice) * quantity;
    
    const profitPct = profit / (entryPrice * quantity) * 100;
    
    const commission = entryOrder.commission + exitOrder.commission;
    const slippage = entryOrder.slippage + exitOrder.slippage;
    const netProfit = profit - commission - slippage;
    
    // 創建交易記錄
    const trade: Trade = {
      id: uuidv4(),
      symbol: order.symbol,
      direction: entryOrder.direction,
      entryTime: entryOrder.filledAt!,
      entryPrice: entryPrice,
      entryOrderId: entryOrder.id,
      exitTime: exitOrder.filledAt!,
      exitPrice: exitPrice,
      exitOrderId: exitOrder.id,
      quantity: quantity,
      profit: profit,
      profitPct: profitPct,
      commission: commission,
      slippage: slippage,
      netProfit: netProfit
    };
    
    this.trades.push(trade);
  }

  /**
   * 更新倉位的未實現盈虧
   */
  private updatePositions(): void {
    const currentPrice = this.getCurrentPrice();
    
    for (const [symbol, position] of this.positions.entries()) {
      if (position.direction === TradeDirection.LONG) {
        position.unrealizedPnl = (currentPrice - position.entryPrice) * position.quantity;
      } else {
        position.unrealizedPnl = (position.entryPrice - currentPrice) * position.quantity;
      }
    }
  }

  /**
   * 記錄權益曲線和回撤曲線
   */
  private recordEquity(): void {
    // 計算當前權益
    let currentEquity = this.cash;
    
    for (const position of this.positions.values()) {
      currentEquity += position.unrealizedPnl;
    }
    
    this.equity.push(currentEquity);
    
    // 記錄權益曲線點
    this.equityCurve.push({
      timestamp: this.currentTime,
      equity: currentEquity
    });
    
    // 更新高水位
    if (currentEquity > this.highWaterMark) {
      this.highWaterMark = currentEquity;
    }
    
    // 計算回撤
    const drawdown = this.highWaterMark - currentEquity;
    const drawdownPct = (drawdown / this.highWaterMark) * 100;
    
    // 記錄回撤曲線點
    this.drawdownCurve.push({
      timestamp: this.currentTime,
      drawdown: drawdown,
      drawdownPct: drawdownPct
    });
  }

  /**
   * 平倉所有倉位
   */
  private closeAllPositions(): void {
    for (const symbol of this.positions.keys()) {
      this.closePosition(symbol);
    }
  }

  /**
   * 計算績效指標
   * @returns 績效指標
   */
  private calculatePerformance(): Performance {
    const totalTrades = this.trades.length;
    const winningTrades = this.trades.filter(t => t.netProfit > 0).length;
    const losingTrades = this.trades.filter(t => t.netProfit <= 0).length;
    
    const totalNetProfit = this.trades.reduce((sum, t) => sum + t.netProfit, 0);
    const totalNetProfitPct = (totalNetProfit / this.settings.initialCapital) * 100;
    
    const winningAmount = this.trades
      .filter(t => t.netProfit > 0)
      .reduce((sum, t) => sum + t.netProfit, 0);
    
    const losingAmount = this.trades
      .filter(t => t.netProfit <= 0)
      .reduce((sum, t) => sum + t.netProfit, 0);
    
    const profitFactor = losingAmount !== 0 ? Math.abs(winningAmount / losingAmount) : 0;
    
    const averageProfit = winningTrades > 0 
      ? winningAmount / winningTrades 
      : 0;
    
    const averageLoss = losingTrades > 0 
      ? losingAmount / losingTrades 
      : 0;
    
    const largestProfit = this.trades.length > 0 
      ? Math.max(...this.trades.map(t => t.netProfit)) 
      : 0;
    
    const largestLoss = this.trades.length > 0 
      ? Math.min(...this.trades.map(t => t.netProfit)) 
      : 0;
    
    // 計算最大回撤
    const maxDrawdown = Math.max(...this.drawdownCurve.map(d => d.drawdown));
    const maxDrawdownPct = Math.max(...this.drawdownCurve.map(d => d.drawdownPct));
    
    // 計算恢復因子
    const recoveryFactor = maxDrawdown > 0 ? totalNetProfit / maxDrawdown : 0;
    
    // 計算夏普比率（簡化版）
    const returns = [];
    for (let i = 1; i < this.equity.length; i++) {
      returns.push((this.equity[i] - this.equity[i-1]) / this.equity[i-1]);
    }
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;
    
    // 計算年化收益率
    const startDate = new Date(this.marketData.timestamp[0] * 1000);
    const endDate = new Date(this.marketData.timestamp[this.marketData.timestamp.length - 1] * 1000);
    const yearFraction = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    const annualReturn = yearFraction > 0 
      ? Math.pow(1 + totalNetProfitPct / 100, 1 / yearFraction) - 1 
      : 0;
    
    // 計算平均持倉時間
    const averageHoldingPeriod = this.trades.length > 0
      ? this.trades.reduce((sum, t) => sum + (t.exitTime - t.entryTime), 0) / this.trades.length / (1000 * 60 * 60 * 24)
      : 0;
    
    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
      totalNetProfit,
      totalNetProfitPct,
      profitFactor,
      averageProfit,
      averageLoss,
      largestProfit,
      largestLoss,
      maxDrawdown,
      maxDrawdownPct,
      recoveryFactor,
      sharpeRatio,
      annualReturn: annualReturn * 100,
      averageHoldingPeriod
    };
  }

  /**
   * 獲取當前價格
   * @returns 當前價格
   */
  private getCurrentPrice(): number {
    return this.marketData.close[this.currentIndex];
  }

  /**
   * 獲取倉位
   * @param symbol 交易標的
   * @returns 倉位
   */
  private getPosition(symbol: string): Position | undefined {
    return this.positions.get(symbol);
  }

  /**
   * 根據日期找到對應的數據索引
   * @param timestamp 時間戳記
   * @returns 索引
   */
  private findDateIndex(timestamp: number): number {
    for (let i = 0; i < this.marketData.timestamp.length; i++) {
      if (this.marketData.timestamp[i] >= timestamp) {
        return i;
      }
    }
    return -1;
  }
}
