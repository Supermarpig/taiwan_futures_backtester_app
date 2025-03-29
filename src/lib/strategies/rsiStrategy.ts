import { BaseStrategy, ParameterType, StrategyParameter } from './base';
import { TradeDirection } from '../backtest/types';
import { MarketData } from '../api/yahooFinance';

/**
 * RSI超買超賣策略
 * 當RSI低於超賣閾值時買入，高於超買閾值時賣出
 */
export class RSIStrategy extends BaseStrategy {
  constructor() {
    super(
      'rsi_strategy',
      'RSI超買超賣策略',
      '利用相對強弱指標(RSI)判斷市場超買超賣狀態。當RSI低於特定值時買入，高於特定值時賣出。適合震盪市場。'
    );
  }

  getParameters(): StrategyParameter[] {
    return [
      {
        id: 'period',
        name: 'RSI週期',
        type: ParameterType.NUMBER,
        default: 14,
        min: 2,
        max: 50,
        step: 1
      },
      {
        id: 'oversold',
        name: '超賣閾值',
        type: ParameterType.NUMBER,
        default: 30,
        min: 10,
        max: 40,
        step: 1
      },
      {
        id: 'overbought',
        name: '超買閾值',
        type: ParameterType.NUMBER,
        default: 70,
        min: 60,
        max: 90,
        step: 1
      }
    ];
  }

  execute(data: MarketData, index: number, params: any): TradeDirection {
    const { period, oversold, overbought } = params;
    
    // 確保有足夠的數據
    if (index < period) {
      return TradeDirection.NONE;
    }
    
    // 計算RSI
    const rsi = this.calculateRSI(data.close, period, index);
    
    // 判斷超買超賣
    if (rsi <= oversold) {
      return TradeDirection.LONG;
    } else if (rsi >= overbought) {
      return TradeDirection.SHORT;
    }
    
    return TradeDirection.NONE;
  }
}
