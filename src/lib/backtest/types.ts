/**
 * 回測引擎核心類型定義
 */

// 交易方向
export enum TradeDirection {
  LONG = 'long',   // 做多
  SHORT = 'short', // 做空
  NONE = 'none'    // 無倉位
}

// 訂單類型
export enum OrderType {
  MARKET = 'market', // 市價單
  LIMIT = 'limit',   // 限價單
  STOP = 'stop'      // 停損單
}

// 訂單狀態
export enum OrderStatus {
  PENDING = 'pending',   // 等待執行
  FILLED = 'filled',     // 已成交
  CANCELED = 'canceled', // 已取消
  REJECTED = 'rejected'  // 已拒絕
}

// 訂單
export interface Order {
  id: string;                     // 訂單ID
  symbol: string;                 // 交易標的
  type: OrderType;                // 訂單類型
  direction: TradeDirection;      // 交易方向
  quantity: number;               // 交易數量
  price?: number;                 // 限價/停損價格（市價單可為空）
  status: OrderStatus;            // 訂單狀態
  createdAt: number;              // 創建時間
  filledAt?: number;              // 成交時間
  filledPrice?: number;           // 成交價格
  commission: number;             // 手續費
  slippage: number;               // 滑點成本
}

// 倉位
export interface Position {
  symbol: string;                 // 交易標的
  direction: TradeDirection;      // 倉位方向
  quantity: number;               // 持有數量
  entryPrice: number;             // 入場均價
  entryTime: number;              // 入場時間
  lastUpdateTime: number;         // 最後更新時間
  unrealizedPnl: number;          // 未實現盈虧
}

// 交易記錄
export interface Trade {
  id: string;                     // 交易ID
  symbol: string;                 // 交易標的
  direction: TradeDirection;      // 交易方向
  entryTime: number;              // 入場時間
  entryPrice: number;             // 入場價格
  entryOrderId: string;           // 入場訂單ID
  exitTime: number;               // 出場時間
  exitPrice: number;              // 出場價格
  exitOrderId: string;            // 出場訂單ID
  quantity: number;               // 交易數量
  profit: number;                 // 交易盈虧
  profitPct: number;              // 交易盈虧百分比
  commission: number;             // 手續費
  slippage: number;               // 滑點成本
  netProfit: number;              // 淨盈虧
}

// 回測設置
export interface BacktestSettings {
  symbol: string;                 // 回測標的
  startDate: number;              // 開始日期
  endDate: number;                // 結束日期
  initialCapital: number;         // 初始資金
  positionSize: number;           // 倉位大小 (%)
  commissionRate: number;         // 手續費率
  slippage: number;               // 滑點設置
  strategyId: string;             // 使用的策略ID
  strategyParams: any;            // 策略參數值
}

// 回測結果
export interface BacktestResult {
  id: string;                     // 回測結果ID
  settings: BacktestSettings;     // 回測設置
  trades: Trade[];                // 交易記錄
  performance: Performance;       // 績效指標
  equity: EquityPoint[];          // 權益曲線
  drawdowns: DrawdownPoint[];     // 回撤曲線
}

// 績效指標
export interface Performance {
  totalTrades: number;            // 總交易次數
  winningTrades: number;          // 獲利交易次數
  losingTrades: number;           // 虧損交易次數
  winRate: number;                // 勝率
  totalNetProfit: number;         // 總淨盈虧
  totalNetProfitPct: number;      // 總淨盈虧百分比
  profitFactor: number;           // 盈虧比
  averageProfit: number;          // 平均盈利
  averageLoss: number;            // 平均虧損
  largestProfit: number;          // 最大盈利
  largestLoss: number;            // 最大虧損
  maxDrawdown: number;            // 最大回撤
  maxDrawdownPct: number;         // 最大回撤百分比
  recoveryFactor: number;         // 恢復因子
  sharpeRatio: number;            // 夏普比率
  annualReturn: number;           // 年化收益率
  averageHoldingPeriod: number;   // 平均持倉時間
}

// 權益曲線點
export interface EquityPoint {
  timestamp: number;              // 時間戳記
  equity: number;                 // 權益值
}

// 回撤曲線點
export interface DrawdownPoint {
  timestamp: number;              // 時間戳記
  drawdown: number;               // 回撤值
  drawdownPct: number;            // 回撤百分比
}
