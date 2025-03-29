import { useEffect, useState } from 'react';
import { StockChartResponse } from './yahooFinance';
import { processMarketData } from './indicators';

/**
 * 自定義Hook，用於獲取股票或期貨數據
 * @param symbol 股票或期貨代碼
 * @param interval 時間間隔
 * @param range 時間範圍
 * @returns 包含數據、載入狀態和錯誤信息的對象
 */
export function useMarketData(
  symbol: string,
  interval: string = '1d',
  range: string = '1y'
) {
  const [data, setData] = useState<StockChartResponse | null>(null);
  const [processedData, setProcessedData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 如果沒有提供股票代碼，則不執行
    if (!symbol) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/yahoo-finance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            symbol,
            interval,
            range,
          }),
        });

        if (!response.ok) {
          throw new Error(`API請求失敗: ${response.status}`);
        }

        const result = await response.json();
        
        // 檢查API回應是否包含所需數據
        if (!result || !result.chart || !result.chart.result || result.chart.result.length === 0) {
          throw new Error('API回應中沒有找到數據');
        }

        const apiResult = result.chart.result[0];
        const meta = apiResult.meta;
        const timestamp = apiResult.timestamp;
        const quote = apiResult.indicators.quote[0];
        const adjclose = apiResult.indicators.adjclose ? apiResult.indicators.adjclose[0].adjclose : undefined;

        // 轉換為我們的數據模型格式
        const formattedData: StockChartResponse = {
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

        setData(formattedData);
        
        // 處理數據，計算技術指標
        const processed = processMarketData(formattedData.data);
        setProcessedData(processed);
      } catch (err) {
        console.error('獲取股票數據時出錯:', err);
        setError(err instanceof Error ? err.message : '未知錯誤');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol, interval, range]);

  return { data, processedData, isLoading, error };
}
