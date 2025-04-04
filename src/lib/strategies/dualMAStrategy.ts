import { BaseStrategy, ParameterType, StrategyParameter } from './base';
import { TradeDirection } from '../backtest/types';
import { MarketData } from '../api/yahooFinance';

/**
 * 雙均線策略
 * 當短期均線從下向上穿越長期均線時買入，從上向下穿越時賣出
 */
export class DualMAStrategy extends BaseStrategy {
  constructor() {
    super(
      'dual_ma',
      '雙均線策略',
      '利用兩條不同週期的移動平均線判斷趨勢。當短期均線從下向上穿越長期均線時買入，從上向下穿越時賣出。加入波動率過濾和趨勢強度確認，提高信號可靠性。'
    );
  }

  getParameters(): StrategyParameter[] {
    return [
      {
        id: 'shortPeriod',
        name: '短期均線週期',
        type: ParameterType.NUMBER,
        default: 5,
        min: 2,
        max: 50,
        step: 1
      },
      {
        id: 'longPeriod',
        name: '長期均線週期',
        type: ParameterType.NUMBER,
        default: 20,
        min: 5,
        max: 200,
        step: 1
      },
      {
        id: 'volumeThreshold',
        name: '成交量閾值',
        type: ParameterType.NUMBER,
        default: 1.5,
        min: 1,
        max: 5,
        step: 0.1,
        description: '相對於平均成交量的倍數'
      },
      {
        id: 'volatilityPeriod',
        name: '波動率週期',
        type: ParameterType.NUMBER,
        default: 20,
        min: 5,
        max: 100,
        step: 1,
        description: '用於計算波動率的週期'
      },
      {
        id: 'volatilityThreshold',
        name: '波動率閾值',
        type: ParameterType.NUMBER,
        default: 0.02,
        min: 0.01,
        max: 0.1,
        step: 0.001,
        description: '最小波動率要求'
      },
      {
        id: 'trendStrengthPeriod',
        name: '趨勢強度週期',
        type: ParameterType.NUMBER,
        default: 10,
        min: 5,
        max: 50,
        step: 1,
        description: '用於計算趨勢強度的週期'
      },
      {
        id: 'trendStrengthThreshold',
        name: '趨勢強度閾值',
        type: ParameterType.NUMBER,
        default: 0.5,
        min: 0.1,
        max: 2,
        step: 0.1,
        description: '最小趨勢強度要求'
      }
    ];
  }

  private calculateVolumeMA(data: number[], period: number, index: number): number {
    if (index < period) {
      return NaN;
    }

    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[index - i];
    }

    return sum / period;
  }

  private calculateVolatility(data: number[], period: number, index: number): number {
    if (index < period) {
      return NaN;
    }

    const returns: number[] = [];
    for (let i = index - period + 1; i <= index; i++) {
      const return_ = (data[i] - data[i - 1]) / data[i - 1];
      returns.push(return_);
    }

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
  }

  private calculateTrendStrength(data: number[], period: number, index: number): number {
    if (index < period) {
      return NaN;
    }

    let upMoves = 0;
    let downMoves = 0;

    for (let i = index - period + 1; i <= index; i++) {
      if (data[i] > data[i - 1]) {
        upMoves++;
      } else if (data[i] < data[i - 1]) {
        downMoves++;
      }
    }

    return Math.abs(upMoves - downMoves) / period;
  }

  execute(data: MarketData, index: number, params: any): TradeDirection {
    const { 
      shortPeriod, 
      longPeriod, 
      volumeThreshold,
      volatilityPeriod,
      volatilityThreshold,
      trendStrengthPeriod,
      trendStrengthThreshold
    } = params;
    
    // 確保有足夠的數據
    if (index < Math.max(longPeriod, volatilityPeriod, trendStrengthPeriod)) {
      return TradeDirection.NONE;
    }
    
    // 計算短期和長期均線
    const shortMA = this.calculateSMA(data.close, shortPeriod, index);
    const longMA = this.calculateSMA(data.close, longPeriod, index);
    
    // 計算前一天的短期和長期均線
    const prevShortMA = this.calculateSMA(data.close, shortPeriod, index - 1);
    const prevLongMA = this.calculateSMA(data.close, longPeriod, index - 1);
    
    // 計算成交量均線
    const volumeMA = this.calculateVolumeMA(data.volume, 20, index);
    const currentVolume = data.volume[index];
    const isVolumeValid = currentVolume > volumeMA * volumeThreshold;
    
    // 計算波動率
    const volatility = this.calculateVolatility(data.close, volatilityPeriod, index);
    const isVolatilityValid = volatility > volatilityThreshold;
    
    // 計算趨勢強度
    const trendStrength = this.calculateTrendStrength(data.close, trendStrengthPeriod, index);
    const isTrendStrong = trendStrength > trendStrengthThreshold;
    
    // 判斷交叉
    const isCrossAbove = prevShortMA <= prevLongMA && shortMA > longMA;
    const isCrossBelow = prevShortMA >= prevLongMA && shortMA < longMA;
    
    if (isCrossAbove && isVolumeValid && isVolatilityValid && isTrendStrong) {
      return TradeDirection.LONG;
    } else if (isCrossBelow && isVolumeValid && isVolatilityValid && isTrendStrong) {
      return TradeDirection.SHORT;
    }
    
    return TradeDirection.NONE;
  }
} 