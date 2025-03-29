import { BaseStrategy, ParameterType, StrategyParameter } from './base';
import { TradeDirection } from '../backtest/types';
import { MarketData } from '../api/yahooFinance';

/**
 * 突破策略
 * 當價格突破前N個交易日的高點時買入，突破前N個交易日的低點時賣出
 */
export class BreakoutStrategy extends BaseStrategy {
  constructor() {
    super(
      'breakout_strategy',
      '突破策略',
      '當價格突破前N個交易日的高點時買入，突破前N個交易日的低點時賣出。這種策略試圖捕捉價格突破後的趨勢。'
    );
  }

  getParameters(): StrategyParameter[] {
    return [
      {
        id: 'period',
        name: '計算區間',
        type: ParameterType.NUMBER,
        default: 20,
        min: 5,
        max: 100,
        step: 1
      },
      {
        id: 'multiplier',
        name: '波動倍數',
        type: ParameterType.NUMBER,
        default: 2,
        min: 0.5,
        max: 5,
        step: 0.1
      }
    ];
  }

  execute(data: MarketData, index: number, params: any): TradeDirection {
    const { period, multiplier } = params;
    
    // 確保有足夠的數據
    if (index < period) {
      return TradeDirection.NONE;
    }
    
    // 找出前N個交易日的最高價和最低價
    let highest = -Infinity;
    let lowest = Infinity;
    
    for (let i = index - period; i < index; i++) {
      highest = Math.max(highest, data.high[i]);
      lowest = Math.min(lowest, data.low[i]);
    }
    
    // 計算波動範圍
    const range = highest - lowest;
    const breakoutThreshold = range * multiplier / 100;
    
    // 當前價格
    const currentPrice = data.close[index];
    
    // 判斷突破
    if (currentPrice > highest + breakoutThreshold) {
      return TradeDirection.LONG;
    } else if (currentPrice < lowest - breakoutThreshold) {
      return TradeDirection.SHORT;
    }
    
    return TradeDirection.NONE;
  }
}
