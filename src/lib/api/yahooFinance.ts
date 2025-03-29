import axios from 'axios';

export interface MarketData {
  symbol: string;
  timestamp: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  adjclose?: number[];
}

export interface MarketMeta {
  symbol: string;
  currency: string;
  exchangeName: string;
  instrumentType: string;
  firstTradeDate: number;
  timezone: string;
  tradingPeriod: {
    regular: {
      start: number;
      end: number;
    }
  }
}

export interface StockChartResponse {
  meta: MarketMeta;
  data: MarketData;
}

/**
 * 從Yahoo Finance API獲取股票或期貨數據
 * @param symbol 股票或期貨代碼，台灣股票加上.TW後綴，如2330.TW
 * @param interval 時間間隔，可選：1m|2m|5m|15m|30m|60m|1d|1wk|1mo
 * @param range 時間範圍，可選：1d|5d|1mo|3mo|6mo|1y|2y|5y|10y|ytd|max
 * @returns 處理後的股票或期貨數據
 */
export async function fetchStockData(
  symbol: string,
  interval: string = '1d',
  range: string = '1y'
): Promise<StockChartResponse> {
  try {
    // 使用Python腳本調用Yahoo Finance API
    const response = await axios.post('/api/yahoo-finance', {
      symbol,
      interval,
      range
    });

    if (response.status !== 200) {
      throw new Error(`API請求失敗: ${response.status}`);
    }

    const data = response.data;
    
    // 檢查API回應是否包含所需數據
    if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('API回應中沒有找到數據');
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const timestamp = result.timestamp;
    const quote = result.indicators.quote[0];
    const adjclose = result.indicators.adjclose ? result.indicators.adjclose[0].adjclose : undefined;

    // 轉換為我們的數據模型格式
    return {
      meta: {
        symbol: meta.symbol,
        currency: meta.currency,
        exchangeName: meta.exchangeName,
        instrumentType: meta.instrumentType,
        firstTradeDate: meta.firstTradeDate,
        timezone: meta.timezone,
        tradingPeriod: {
          regular: {
            start: meta.currentTradingPeriod.regular.start,
            end: meta.currentTradingPeriod.regular.end
          }
        }
      },
      data: {
        symbol: meta.symbol,
        timestamp,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume,
        adjclose
      }
    };
  } catch (error) {
    console.error('獲取股票數據時出錯:', error);
    throw error;
  }
}

/**
 * 獲取台灣股票數據
 * @param symbol 股票代碼，不需要加上.TW後綴
 * @param interval 時間間隔
 * @param range 時間範圍
 * @returns 處理後的股票數據
 */
export async function fetchTaiwanStockData(
  symbol: string,
  interval: string = '1d',
  range: string = '1y'
): Promise<StockChartResponse> {
  // 台灣股票代碼需要加上.TW後綴
  const formattedSymbol = symbol.includes('.TW') ? symbol : `${symbol}.TW`;
  return fetchStockData(formattedSymbol, interval, range);
}

/**
 * 獲取台灣期貨數據
 * @param symbol 期貨代碼
 * @param interval 時間間隔
 * @param range 時間範圍
 * @returns 處理後的期貨數據
 */
export async function fetchTaiwanFuturesData(
  symbol: string = 'TXFF',  // 預設為台指期
  interval: string = '1d',
  range: string = '1y'
): Promise<StockChartResponse> {
  // 台灣期貨代碼可能需要特殊處理
  return fetchStockData(symbol, interval, range);
}
