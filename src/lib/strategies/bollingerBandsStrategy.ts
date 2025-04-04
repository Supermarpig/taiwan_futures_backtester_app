import { BaseStrategy, ParameterType, StrategyParameter } from './base';
import { TradeDirection } from '../backtest/types';
import { MarketData } from '../api/yahooFinance';

/**
 * 布林帶策略
 * 當價格觸及布林帶下軌時買入，觸及上軌時賣出
 */
export class BollingerBandsStrategy extends BaseStrategy {
  constructor() {
    super(
      'bollinger_bands',
      '布林帶策略',
      '利用布林帶指標判斷市場超買超賣狀態。當價格觸及布林帶下軌時買入，觸及上軌時賣出。加入趨勢確認和成交量確認，提高信號可靠性。'
    );
  }

  getParameters(): StrategyParameter[] {
    return [
      {
        id: 'period',
        name: '計算週期',
        type: ParameterType.NUMBER,
        default: 20,
        min: 5,
        max: 100,
        step: 1
      },
      {
        id: 'multiplier',
        name: '標準差倍數',
        type: ParameterType.NUMBER,
        default: 2,
        min: 1,
        max: 5,
        step: 0.1
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
        id: 'volumeThreshold',
        name: '成交量閾值',
        type: ParameterType.NUMBER,
        default: 1.5,
        min: 1,
        max: 5,
        step: 0.1,
        description: '相對於平均成交量的倍數'
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

  execute(data: MarketData, index: number, params: any): TradeDirection {
    const { period, multiplier, trendPeriod, volumeThreshold } = params;
    
    // 確保有足夠的數據
    if (index < Math.max(period, trendPeriod)) {
      return TradeDirection.NONE;
    }
    
    // 計算布林帶
    const bands = this.calculateBollingerBands(data.close, period, multiplier, index);
    
    // 計算趨勢確認均線
    const trendMA = this.calculateSMA(data.close, trendPeriod, index);
    
    // 計算成交量均線
    const volumeMA = this.calculateVolumeMA(data.volume, 20, index);
    const currentVolume = data.volume[index];
    const isVolumeValid = currentVolume > volumeMA * volumeThreshold;
    
    // 當前價格
    const currentPrice = data.close[index];
    
    // 判斷趨勢
    const isUptrend = currentPrice > trendMA;
    const isDowntrend = currentPrice < trendMA;
    
    // 判斷買賣信號
    if (currentPrice <= bands.lower && isUptrend && isVolumeValid) {
      return TradeDirection.LONG;
    } else if (currentPrice >= bands.upper && isDowntrend && isVolumeValid) {
      return TradeDirection.SHORT;
    }
    
    return TradeDirection.NONE;
  }
} 