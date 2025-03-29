import { MarketData } from './yahooFinance';

/**
 * 計算簡單移動平均線
 * @param data 價格數據陣列
 * @param period 週期
 * @returns 移動平均線數據陣列
 */
export function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // 數據不足一個週期時，填充null
      result.push(NaN);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    
    result.push(sum / period);
  }
  
  return result;
}

/**
 * 計算相對強弱指標 (RSI)
 * @param data 價格數據陣列
 * @param period 週期，通常為14
 * @returns RSI數據陣列
 */
export function calculateRSI(data: number[], period: number): number[] {
  const result: number[] = [];
  const changes: number[] = [];
  
  // 計算價格變化
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  // 計算RSI
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      // 數據不足一個週期時，填充null
      result.push(NaN);
      continue;
    }
    
    let gains = 0;
    let losses = 0;
    
    // 計算過去period天的漲跌
    for (let j = 0; j < period; j++) {
      const change = changes[i - j - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    // 避免除以零
    if (losses === 0) {
      result.push(100);
    } else {
      const rs = gains / losses;
      result.push(100 - (100 / (1 + rs)));
    }
  }
  
  return result;
}

/**
 * 計算布林帶
 * @param data 價格數據陣列
 * @param period 週期，通常為20
 * @param multiplier 標準差乘數，通常為2
 * @returns 包含中軌、上軌和下軌的布林帶數據
 */
export function calculateBollingerBands(
  data: number[],
  period: number,
  multiplier: number
): { middle: number[]; upper: number[]; lower: number[] } {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // 數據不足一個週期時，填充null
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    
    // 計算標準差
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += Math.pow(data[i - j] - middle[i], 2);
    }
    
    const stdDev = Math.sqrt(sum / period);
    
    upper.push(middle[i] + multiplier * stdDev);
    lower.push(middle[i] - multiplier * stdDev);
  }
  
  return { middle, upper, lower };
}

/**
 * 處理市場數據，計算技術指標
 * @param marketData 市場數據
 * @returns 包含原始數據和技術指標的處理後數據
 */
export function processMarketData(marketData: MarketData) {
  const { close } = marketData;
  
  // 計算常用技術指標
  const sma5 = calculateSMA(close, 5);
  const sma10 = calculateSMA(close, 10);
  const sma20 = calculateSMA(close, 20);
  const sma60 = calculateSMA(close, 60);
  
  const rsi14 = calculateRSI(close, 14);
  
  const bollingerBands = calculateBollingerBands(close, 20, 2);
  
  return {
    ...marketData,
    indicators: {
      sma5,
      sma10,
      sma20,
      sma60,
      rsi14,
      bollingerBands
    }
  };
}
