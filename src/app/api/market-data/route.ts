import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'
import { MarketData } from '@/lib/api/yahooFinance'
import { TaifexDataService } from '@/lib/api/taifexDataService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('接收到市場數據請求:', { symbol, startDate, endDate })

    if (!symbol || !startDate || !endDate) {
      return NextResponse.json(
        { error: '缺少必要參數', params: { symbol, startDate, endDate } },
        { status: 400 }
      )
    }

    // 檢查日期是否有效
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: '日期格式無效' },
        { status: 400 }
      )
    }

    if (start > now || end > now) {
      return NextResponse.json(
        { error: '不能查詢未來的數據' },
        { status: 400 }
      )
    }

    try {
      let marketData: MarketData;

      // 如果是期貨數據，使用本地數據服務
      if (symbol.startsWith('TX')) {
        const taifexService = TaifexDataService.getInstance();
        marketData = await taifexService.getMarketData(symbol, startDate, endDate);
      } else {
        // 其他商品使用 Yahoo Finance
        const queryOptions = {
          period1: start,
          period2: end,
          interval: '1d'
        }

        // 修改股票代碼格式以符合 Yahoo Finance 的要求
        let formattedSymbol = symbol
        if (!symbol.endsWith('.TW')) {
          formattedSymbol = `${symbol}.TW`
        }

        const result = await yahooFinance.historical(formattedSymbol, queryOptions)

        if (!result || result.length === 0) {
          throw new Error('無法獲取市場數據')
        }

        // 轉換數據格式
        marketData = {
          symbol: formattedSymbol,
          timestamp: result.map(item => Math.floor(item.date.getTime() / 1000)),
          open: result.map(item => item.open),
          high: result.map(item => item.high),
          low: result.map(item => item.low),
          close: result.map(item => item.close),
          volume: result.map(item => item.volume || 0)
        }
      }

      return NextResponse.json(marketData)
    } catch (error) {
      console.error('獲取市場數據時出錯:', error)
      return NextResponse.json(
        { error: '獲取市場數據時出錯', details: error instanceof Error ? error.message : '未知錯誤' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API 路由處理錯誤:', error)
    return NextResponse.json(
      { error: '處理請求時出錯', details: error instanceof Error ? error.message : '未知錯誤' },
      { status: 500 }
    )
  }
} 