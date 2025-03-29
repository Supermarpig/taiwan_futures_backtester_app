import { BaseStrategy, ParameterType, StrategyParameter } from './base';
import { TradeDirection } from '../backtest/types';
import { MarketData } from '../api/yahooFinance';

/**
 * 均線交叉策略
 * 當短期均線上穿長期均線時買入，下穿時賣出
 */
export class MACrossoverStrategy extends BaseStrategy {
  constructor() {
    super(
      'ma_crossover',
      '均線交叉策略',
      '當短期均線上穿長期均線時買入，下穿時賣出。這是一種趨勢跟蹤策略，適合在有明確趨勢的市場中使用。'
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
      }
    ];
  }

  execute(data: MarketData, index: number, params: any): TradeDirection {
    const { shortPeriod, longPeriod } = params;
    
    // 確保有足夠的數據
    if (index < longPeriod) {
      return TradeDirection.NONE;
    }
    
    // 計算短期和長期均線
    const shortMA = this.calculateSMA(data.close, shortPeriod, index);
    const longMA = this.calculateSMA(data.close, longPeriod, index);
    
    // 計算前一天的短期和長期均線
    const prevShortMA = this.calculateSMA(data.close, shortPeriod, index - 1);
    const prevLongMA = this.calculateSMA(data.close, longPeriod, index - 1);
    
    // 判斷交叉
    const isCrossAbove = prevShortMA <= prevLongMA && shortMA > longMA;
    const isCrossBelow = prevShortMA >= prevLongMA && shortMA < longMA;
    
    if (isCrossAbove) {
      return TradeDirection.LONG;
    } else if (isCrossBelow) {
      return TradeDirection.SHORT;
    }
    
    return TradeDirection.NONE;
  }
}
