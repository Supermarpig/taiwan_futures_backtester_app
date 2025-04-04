import { BaseStrategy, ParameterType, StrategyParameter } from './base';
import { TradeDirection } from '../backtest/types';
import { MarketData } from '../api/yahooFinance';
import { Strategy } from './base';

/**
 * 策略組合
 * 將多個策略組合在一起，根據市場環境動態調整權重
 */
export class StrategyCombination extends BaseStrategy {
  private strategies: Strategy[];
  private weights: number[];

  constructor(strategies: Strategy[]) {
    super(
      'strategy_combination',
      '策略組合',
      '將多個策略組合在一起，根據市場環境動態調整權重。可以分散風險，提高策略的穩定性。'
    );
    this.strategies = strategies;
    this.weights = new Array(strategies.length).fill(1 / strategies.length);
  }

  getParameters(): StrategyParameter[] {
    return [
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
        id: 'trendPeriod',
        name: '趨勢週期',
        type: ParameterType.NUMBER,
        default: 50,
        min: 20,
        max: 200,
        step: 1,
        description: '用於判斷趨勢的週期'
      },
      {
        id: 'rebalancePeriod',
        name: '再平衡週期',
        type: ParameterType.NUMBER,
        default: 20,
        min: 5,
        max: 100,
        step: 1,
        description: '策略權重再平衡的週期'
      }
    ];
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

  private calculateTrend(data: number[], period: number, index: number): number {
    if (index < period) {
      return NaN;
    }

    const sma = this.calculateSMA(data, period, index);
    const currentPrice = data[index];
    return (currentPrice - sma) / sma;
  }

  private updateWeights(data: MarketData, index: number, params: any): void {
    const { volatilityPeriod, trendPeriod, rebalancePeriod } = params;
    
    // 每rebalancePeriod個週期更新一次權重
    if (index % rebalancePeriod !== 0) {
      return;
    }

    // 計算市場環境指標
    const volatility = this.calculateVolatility(data.close, volatilityPeriod, index);
    const trend = this.calculateTrend(data.close, trendPeriod, index);
    
    // 根據市場環境調整權重
    this.weights = this.strategies.map((strategy, i) => {
      let weight = 1;
      
      // 根據策略特性調整權重
      if (strategy.id.includes('ma') || strategy.id.includes('trend')) {
        // 趨勢策略在強趨勢市場中增加權重
        weight *= (1 + Math.abs(trend));
      } else if (strategy.id.includes('rsi') || strategy.id.includes('bollinger')) {
        // 震盪策略在波動率高的市場中增加權重
        weight *= (1 + volatility);
      }
      
      return weight;
    });
    
    // 正規化權重
    const totalWeight = this.weights.reduce((a, b) => a + b, 0);
    this.weights = this.weights.map(w => w / totalWeight);
  }

  execute(data: MarketData, index: number, params: any): TradeDirection {
    // 更新策略權重
    this.updateWeights(data, index, params);
    
    // 計算每個策略的信號
    const signals = this.strategies.map((strategy, i) => {
      const signal = strategy.execute(data, index, params);
      return {
        signal,
        weight: this.weights[i]
      };
    });
    
    // 計算加權信號
    let weightedSignal = 0;
    signals.forEach(({ signal, weight }) => {
      if (signal === TradeDirection.LONG) {
        weightedSignal += weight;
      } else if (signal === TradeDirection.SHORT) {
        weightedSignal -= weight;
      }
    });
    
    // 根據加權信號決定交易方向
    if (weightedSignal > 0.5) {
      return TradeDirection.LONG;
    } else if (weightedSignal < -0.5) {
      return TradeDirection.SHORT;
    }
    
    return TradeDirection.NONE;
  }
} 