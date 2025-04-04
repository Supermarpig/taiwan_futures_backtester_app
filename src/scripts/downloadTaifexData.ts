import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { TaifexDataService, TaifexDailyData } from '../lib/api/taifexDataService';

interface FuturesData {
  date: string;
  contract: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openInterest: number;
}

async function downloadTaifexData() {
  try {
    console.log('開始下載台指期貨數據...');

    // 設定下載參數
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    
    // 下載最近一年的數據
    const data: TaifexDailyData[] = [];
    
    // 期交所網址
    const baseUrl = 'https://www.taifex.com.tw/cht/3/futDataDown';
    
    // 下載最近12個月的數據
    for (let i = 0; i < 12; i++) {
      const targetDate = new Date(year, month - i - 1, 1);
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      console.log(`下載 ${yyyy}/${mm} 的數據...`);
      
      try {
        // 構建請求參數
        const params = new URLSearchParams();
        params.append('down_type', '1');
        params.append('commodity_id', 'TX');
        params.append('queryStartDate', `${yyyy}/${mm}/01`);
        params.append('queryEndDate', `${yyyy}/${mm}/31`);
        
        const url = `${baseUrl}?${params.toString()}`;
        console.log(`下載網址: ${url}`);
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          responseType: 'arraybuffer',
          timeout: 10000
        });

        console.log(`收到回應，狀態碼: ${response.status}`);
        console.log(`數據大小: ${response.data.length} bytes`);
        
        // 將 Big5 編碼的 CSV 轉換為 UTF-8
        const iconv = require('iconv-lite');
        const csvContent = iconv.decode(response.data, 'big5');
        
        // 解析 CSV 數據
        const lines = csvContent.split('\n');
        console.log(`CSV 行數: ${lines.length}`);
        
        for (let j = 1; j < lines.length; j++) {
          const line = lines[j].trim();
          if (!line) continue;
          
          // 跳過 HTML 標籤
          if (line.startsWith('<') || line.includes('</')) {
            console.log(`跳過 HTML 標籤: ${line}`);
            continue;
          }
          
          const columns = line.split(',');
          if (columns.length < 8) {
            console.log(`跳過無效行: ${line}`);
            continue;
          }
          
          // 只處理台指期貨的數據
          if (!columns[1].startsWith('TX')) {
            continue;
          }
          
          try {
            const dateStr = columns[0];
            const [yyyy, mm, dd] = dateStr.split('/');
            
            // 解析數值並移除逗號
            const open = parseFloat(columns[3].replace(/,/g, ''));
            const high = parseFloat(columns[4].replace(/,/g, ''));
            const low = parseFloat(columns[5].replace(/,/g, ''));
            const close = parseFloat(columns[6].replace(/,/g, ''));
            let volume = parseInt(columns[8].replace(/,/g, '')); // 修正為第9欄位
            let openInterest = parseInt(columns[11].replace(/,/g, '')); // 修正為第12欄位

            // 驗證數據有效性
            if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
              console.log(`跳過無效價格數據: ${line}`);
              continue;
            }

            // 驗證價格邏輯關係
            if (high < low) {
              console.log(`跳過不合理價格數據: ${line}`);
              continue;
            }

            // 驗證成交量和未平倉量
            if (isNaN(volume) || volume < 0) {
              volume = 0; // 如果成交量無效，設為0
            }
            if (isNaN(openInterest) || openInterest < 0) {
              openInterest = 0; // 如果未平倉量無效，設為0
            }
            
            const item: TaifexDailyData = {
              date: `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`,
              contract: 'TXFF',
              open,
              high,
              low,
              close,
              volume,
              openInterest
            };
            
            data.push(item);
            console.log(`成功解析數據: ${item.date}, 收盤價: ${item.close}, 成交量: ${item.volume}, 未平倉: ${item.openInterest}`);
          } catch (parseError) {
            console.error(`解析行數據時出錯: ${line}`, parseError);
          }
        }
      } catch (monthError) {
        console.error(`下載 ${yyyy}/${mm} 的數據時出錯:`, monthError);
      }
      
      // 等待兩秒，避免請求過於頻繁
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (data.length === 0) {
      throw new Error('沒有成功下載到任何數據');
    }
    
    // 按日期排序
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 保存數據
    const taifexService = TaifexDataService.getInstance();
    await taifexService.saveMarketData('TXFF', data);
    
    console.log(`成功下載並保存了 ${data.length} 筆數據！`);
  } catch (error) {
    console.error('下載數據時出錯:', error);
    process.exit(1);
  }
}

function isValidNumber(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0 && num < 100000;
}

function parseTaifexData(csvContent: string): FuturesData[] {
  const lines = csvContent.split('\n');
  const data: FuturesData[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('<') || trimmedLine.includes('</') || !trimmedLine) {
      continue;
    }

    const columns = line.split(',').map(col => col.trim());
    if (columns.length < 10) continue;

    // 檢查是否為TX期貨
    if (!columns[1] || !columns[1].startsWith('TX')) continue;

    // 解析日期
    const dateMatch = columns[0].match(/(\d{4})\/(\d{2})\/(\d{2})/);
    if (!dateMatch) continue;
    
    const [_, year, month, day] = dateMatch;
    const date = `${year}-${month}-${day}`;

    // 檢查價格數據
    const open = columns[3];
    const high = columns[4];
    const low = columns[5];
    const close = columns[6];
    const volume = columns[8];
    const openInterest = columns[11];

    if (!isValidNumber(open) || !isValidNumber(high) || !isValidNumber(low) || !isValidNumber(close)) {
      console.log(`跳過無效價格數據: ${line}`);
      continue;
    }

    const openPrice = parseFloat(open);
    const highPrice = parseFloat(high);
    const lowPrice = parseFloat(low);
    const closePrice = parseFloat(close);
    const volumeValue = parseInt(volume) || 0;
    const openInterestValue = parseInt(openInterest) || 0;

    // 基本價格邏輯驗證
    if (highPrice < lowPrice || openPrice > highPrice || openPrice < lowPrice || 
        closePrice > highPrice || closePrice < lowPrice) {
      console.log(`跳過價格邏輯錯誤數據: ${line}`);
      continue;
    }

    data.push({
      date,
      contract: 'TXFF',
      open: openPrice,
      high: highPrice,
      low: lowPrice,
      close: closePrice,
      volume: volumeValue,
      openInterest: openInterestValue
    });
  }

  return data;
}

// 執行下載
downloadTaifexData(); 