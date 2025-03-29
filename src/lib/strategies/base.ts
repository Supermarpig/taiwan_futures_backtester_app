import { TradeDirection } from '../backtest/types';
import { MarketData } from '../api/yahooFinance';

/**
 * 策略介面
 * 所有交易策略都應實現此介面
 */
export interface Strategy {
  id: string;
  name: string;
  description: string;
  getParameters(): StrategyParameter[];
  execute(data: MarketData, index: number, params: any): TradeDirection;
}

/**
 * 策略參數類型
 */
export enum ParameterType {
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  STRING = 'string',
  SELECT = 'select'
}

/**
 * 策略參數介面
 */
export interface StrategyParameter {
  id: string;
  name: string;
  type: ParameterType;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: any; label: string }[];
}

/**
 * 策略基類
 * 提供基本功能，所有具體策略都應繼承此類
 */
export abstract class BaseStrategy implements Strategy {
  id: string;
  name: string;
  description: string;

  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }

  /**
   * 獲取策略參數定義
   * 子類必須實現此方法
   */
  abstract getParameters(): StrategyParameter[];

  /**
   * 執行策略
   * 子類必須實現此方法
   * @param data 市場數據
   * @param index 當前索引
   * @param params 策略參數
   */
  abstract execute(data: MarketData, index: number, params: any): TradeDirection;

  /**
   * 獲取指定索引的收盤價
   * @param data 市場數據
   * @param index 索引
   */
  protected getClose(data: MarketData, index: number): number {
    return data.close[index];
  }

  /**
   * 獲取指定索引的開盤價
   * @param data 市場數據
   * @param index 索引
   */
  protected getOpen(data: MarketData, index: number): number {
    return data.open[index];
  }

  /**
   * 獲取指定索引的最高價
   * @param data 市場數據
   * @param index 索引
   */
  protected getHigh(data: MarketData, index: number): number {
    return data.high[index];
  }

  /**
   * 獲取指定索引的最低價
   * @param data 市場數據
   * @param index 索引
   */
  protected getLow(data: MarketData, index: number): number {
    return data.low[index];
  }

  /**
   * 獲取指定索引的成交量
   * @param data 市場數據
   * @param index 索引
   */
  protected getVolume(data: MarketData, index: number): number {
    return data.volume[index];
  }

  /**
   * 計算簡單移動平均線
   * @param data 價格數據陣列
   * @param period 週期
   * @param index 當前索引
   */
  protected calculateSMA(data: number[], period: number, index: number): number {
    if (index < period - 1) {
      return NaN;
    }

    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[index - i];
    }

    return sum / period;
  }

  /**
   * 計算相對強弱指標 (RSI)
   * @param data 價格數據陣列
   * @param period 週期
   * @param index 當前索引
   */
  protected calculateRSI(data: number[], period: number, index: number): number {
    if (index < period) {
      return NaN;
    }

    let gains = 0;
    let losses = 0;

    for (let i = index - period + 1; i <= index; i++) {
      const change = data[i] - data[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    if (losses === 0) {
      return 100;
    }

    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  }

  /**
   * 計算布林帶
   * @param data 價格數據陣列
   * @param period 週期
   * @param multiplier 標準差乘數
   * @param index 當前索引
   */
  protected calculateBollingerBands(
    data: number[],
    period: number,
    multiplier: number,
    index: number
  ): { middle: number; upper: number; lower: number } {
    if (index < period - 1) {
      return { middle: NaN, upper: NaN, lower: NaN };
    }

    const middle = this.calculateSMA(data, period, index);

    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += Math.pow(data[index - i] - middle, 2);
    }

    const stdDev = Math.sqrt(sum / period);

    return {
      middle,
      upper: middle + multiplier * stdDev,
      lower: middle - multiplier * stdDev
    };
  }
}
