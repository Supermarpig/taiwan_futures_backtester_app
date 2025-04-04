import fs from 'fs';
import path from 'path';
import { MarketData } from './yahooFinance';

export interface TaifexDailyData {
  date: string;
  contract: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest: number;
}

export class TaifexDataService {
  private static instance: TaifexDataService;
  private dataDir: string;

  private constructor() {
    this.dataDir = path.join(process.cwd(), 'src/data/futures');
    // 確保數據目錄存在
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  public static getInstance(): TaifexDataService {
    if (!TaifexDataService.instance) {
      TaifexDataService.instance = new TaifexDataService();
    }
    return TaifexDataService.instance;
  }

  /**
   * 讀取本地期貨數據
   * @param symbol 期貨代碼
   * @param startDate 開始日期
   * @param endDate 結束日期
   * @returns 市場數據
   */
  public async getMarketData(
    symbol: string,
    startDate: string,
    endDate: string
  ): Promise<MarketData> {
    try {
      // 讀取本地數據文件
      const dataFile = path.join(this.dataDir, `${symbol}.json`);
      
      if (!fs.existsSync(dataFile)) {
        throw new Error(`找不到期貨數據文件: ${dataFile}`);
      }

      const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf-8')) as TaifexDailyData[];

      // 過濾日期範圍內的數據
      const filteredData = rawData.filter(item => {
        const date = new Date(item.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });

      // 轉換為 MarketData 格式
      const marketData: MarketData = {
        symbol,
        timestamp: filteredData.map(item => new Date(item.date).getTime() / 1000),
        open: filteredData.map(item => item.open),
        high: filteredData.map(item => item.high),
        low: filteredData.map(item => item.low),
        close: filteredData.map(item => item.close),
        volume: filteredData.map(item => item.volume)
      };

      return marketData;
    } catch (error) {
      console.error('讀取期貨數據時出錯:', error);
      throw error;
    }
  }

  /**
   * 保存期貨數據到本地文件
   * @param symbol 期貨代碼
   * @param data 期貨數據
   */
  public async saveMarketData(symbol: string, data: TaifexDailyData[]): Promise<void> {
    try {
      const dataFile = path.join(this.dataDir, `${symbol}.json`);
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
      console.log(`期貨數據已保存到: ${dataFile}`);
    } catch (error) {
      console.error('保存期貨數據時出錯:', error);
      throw error;
    }
  }
} 