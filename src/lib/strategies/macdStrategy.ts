import { BaseStrategy, ParameterType, StrategyParameter } from './base';
import { TradeDirection } from '../backtest/types';
import { MarketData } from '../api/yahooFinance';

/**
 * MACD策略
 * 當MACD線從下向上穿越信號線時買入，從上向下穿越時賣出
 */
export class MACDStrategy extends BaseStrategy {
  constructor() {
    super(
      'macd_strategy',
      'MACD策略',
      '利用MACD指標判斷趨勢轉折點。當MACD線從下向上穿越信號線時買入，從上向下穿越時賣出。加入趨勢確認和動量確認，提高信號可靠性。'
    );
  }

  getParameters(): StrategyParameter[] {
    return [
      {
        id: 'fastPeriod',
        name: '快線週期',
        type: ParameterType.NUMBER,
        default: 12,
        min: 5,
        max: 30,
        step: 1
      },
      {
        id: 'slowPeriod',
        name: '慢線週期',
        type: ParameterType.NUMBER,
        default: 26,
        min: 10,
        max: 50,
        step: 1
      },
      {
        id: 'signalPeriod',
        name: '信號線週期',
        type: ParameterType.NUMBER,
        default: 9,
        min: 5,
        max: 20,
        step: 1
      },
      {
        id: 'trendPeriod',
        name: '趨勢確認週期',
        type: ParameterType.NUMBER,
        default: 50,
        min: 20,
        max: 200,
        step: 1,
        description: '用於確認趨勢的長期均線週期'
      },
      {
        id: 'momentumThreshold',
        name: '動量閾值',
        type: ParameterType.NUMBER,
        default: 0.5,
        min: 0.1,
        max: 2,
        step: 0.1,
        description: 'MACD柱狀圖的閾值'
      }
    ];
  }

  private calculateEMA(data: number[], period: number, index: number): number {
    if (index < period) {
      return NaN;
    }

    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(data, period, index);

    for (let i = index - period + 1; i <= index; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }

    return ema;
  }

  private calculateMACD(data: number[], fastPeriod: number, slowPeriod: number, signalPeriod: number, index: number): {
    macd: number;
    signal: number;
    histogram: number;
  } {
    const fastEMA = this.calculateEMA(data, fastPeriod, index);
    const slowEMA = this.calculateEMA(data, slowPeriod, index);
    const macd = fastEMA - slowEMA;
    const signal = this.calculateEMA([macd], signalPeriod, 0);
    const histogram = macd - signal;

    return { macd, signal, histogram };
  }

  execute(data: MarketData, index: number, params: any): TradeDirection {
    const { fastPeriod, slowPeriod, signalPeriod, trendPeriod, momentumThreshold } = params;
    
    // 確保有足夠的數據
    if (index < Math.max(slowPeriod + signalPeriod, trendPeriod)) {
      return TradeDirection.NONE;
    }
    
    // 計算當前MACD
    const currentMACD = this.calculateMACD(data.close, fastPeriod, slowPeriod, signalPeriod, index);
    
    // 計算前一天的MACD
    const prevMACD = this.calculateMACD(data.close, fastPeriod, slowPeriod, signalPeriod, index - 1);
    
    // 計算趨勢確認均線
    const trendMA = this.calculateSMA(data.close, trendPeriod, index);
    const currentPrice = data.close[index];
    
    // 判斷趨勢
    const isUptrend = currentPrice > trendMA;
    const isDowntrend = currentPrice < trendMA;
    
    // 判斷動量
    const hasStrongMomentum = Math.abs(currentMACD.histogram) > momentumThreshold;
    
    // 判斷交叉
    const isCrossAbove = prevMACD.macd <= prevMACD.signal && currentMACD.macd > currentMACD.signal;
    const isCrossBelow = prevMACD.macd >= prevMACD.signal && currentMACD.macd < currentMACD.signal;
    
    if (isCrossAbove && isUptrend && hasStrongMomentum) {
      return TradeDirection.LONG;
    } else if (isCrossBelow && isDowntrend && hasStrongMomentum) {
      return TradeDirection.SHORT;
    }
    
    return TradeDirection.NONE;
  }
} 