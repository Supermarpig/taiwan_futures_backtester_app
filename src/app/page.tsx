'use client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <h1 className="text-4xl font-bold mb-6 text-center">台灣股票期貨回測系統</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        專業的台灣股票期貨回測平台，提供多種策略測試，幫助您優化交易決策
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
        <Card className="p-6 flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-3">多種策略</h2>
          <p className="mb-4">測試各種交易策略，找出最適合您的交易方式</p>
        </Card>
        
        <Card className="p-6 flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-3">詳細分析</h2>
          <p className="mb-4">查看交易次數、獲利情況和各項績效指標</p>
        </Card>
        
        <Card className="p-6 flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold mb-3">視覺化報表</h2>
          <p className="mb-4">透過圖表直觀了解策略表現和盈虧分布</p>
        </Card>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/backtest">
          <Button size="lg" className="px-6">
            開始回測
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        
        <Link href="/strategies">
          <Button variant="outline" size="lg" className="px-6">
            瀏覽策略
          </Button>
        </Link>
      </div>
    </main>
  )
}
