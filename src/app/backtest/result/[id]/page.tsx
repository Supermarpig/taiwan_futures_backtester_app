'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Play, LineChart, BarChart3, List } from 'lucide-react'
import Link from 'next/link'
import { useMarketData } from '@/lib/api/useMarketData'
import { BacktestEngine } from '@/lib/backtest/engine'
import { StrategyRegistry } from '@/lib/strategies/registry'
import { BacktestResult, TradeDirection } from '@/lib/backtest/types'
import { Strategy } from '@/lib/strategies/base'
import { EquityCurveChart, DrawdownChart, TradeDistributionChart, ProfitDistributionChart } from '@/components/charts'
import { PriceChartWithTrades } from '@/components/priceChart'

export default function BacktestResultPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('summary')
  
  // 模擬回測結果載入
  useEffect(() => {
    const loadResult = async () => {
      try {
        setIsLoading(true)
        
        // 這裡應該從API或本地存儲獲取回測結果
        // 目前使用模擬數據
        
        // 獲取策略註冊表
        const registry = StrategyRegistry.getInstance()
        
        // 假設使用均線交叉策略
        const strategy = registry.getStrategy('ma_crossover')
        
        if (!strategy) {
          throw new Error('找不到策略')
        }
        
        // 模擬市場數據
        const mockMarketData = {
          symbol: '2330.TW',
          timestamp: Array.from({ length: 100 }, (_, i) => Date.now() - (99 - i) * 24 * 60 * 60 * 1000),
          open: Array.from({ length: 100 }, () => Math.random() * 100 + 500),
          high: Array.from({ length: 100 }, () => Math.random() * 100 + 550),
          low: Array.from({ length: 100 }, () => Math.random() * 100 + 450),
          close: Array.from({ length: 100 }, () => Math.random() * 100 + 500),
          volume: Array.from({ length: 100 }, () => Math.random() * 1000000)
        }
        
        // 回測設置
        const backtestSettings = {
          symbol: '2330.TW',
          startDate: mockMarketData.timestamp[0],
          endDate: mockMarketData.timestamp[mockMarketData.timestamp.length - 1],
          initialCapital: 1000000,
          positionSize: 10,
          commissionRate: 0.1425,
          slippage: 0.1,
          strategyId: strategy.id,
          strategyParams: {
            shortPeriod: 5,
            longPeriod: 20
          }
        }
        
        // 創建回測引擎
        const engine = new BacktestEngine(backtestSettings, mockMarketData)
        
        // 執行回測
        const backtestResult = engine.run((data, index, params) => {
          return strategy.execute(data, index, params)
        })
        
        setResult(backtestResult)
      } catch (error) {
        console.error('載入回測結果時出錯:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadResult()
  }, [])
  
  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col p-8">
        <div className="flex items-center mb-8">
          <Link href="/backtest">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">回測結果</h1>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">載入回測結果中...</p>
        </div>
      </main>
    )
  }
  
  if (!result) {
    return (
      <main className="flex min-h-screen flex-col p-8">
        <div className="flex items-center mb-8">
          <Link href="/backtest">
            <Button variant="ghost" size="icon" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">回測結果</h1>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">無法載入回測結果</p>
        </div>
      </main>
    )
  }
  
  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="flex items-center mb-8">
        <Link href="/backtest">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">回測結果</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">回測概要</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">標的</span>
                <span className="font-medium">{result.settings.symbol}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">策略</span>
                <span className="font-medium">{result.settings.strategyId}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">初始資金</span>
                <span className="font-medium">{result.settings.initialCapital.toLocaleString()} 元</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">回測期間</span>
                <span className="font-medium">
                  {new Date(result.settings.startDate).toLocaleDateString()} - 
                  {new Date(result.settings.endDate).toLocaleDateString()}
                </span>
              </div>
              
              <hr />
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">總交易次數</span>
                <span className="font-medium">{result.performance.totalTrades}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">勝率</span>
                <span className="font-medium">{result.performance.winRate.toFixed(2)}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">總淨盈虧</span>
                <span className={`font-medium ${result.performance.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.performance.totalNetProfit.toLocaleString()} 元
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">總報酬率</span>
                <span className={`font-medium ${result.performance.totalNetProfitPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.performance.totalNetProfitPct.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">最大回撤</span>
                <span className="font-medium text-red-600">
                  {result.performance.maxDrawdownPct.toFixed(2)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">夏普比率</span>
                <span className="font-medium">
                  {result.performance.sharpeRatio.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="summary" className="flex items-center">
                  <LineChart className="h-4 w-4 mr-2" />
                  績效概覽
                </TabsTrigger>
                <TabsTrigger value="trades" className="flex items-center">
                  <List className="h-4 w-4 mr-2" />
                  交易記錄
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  詳細統計
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">權益曲線</h3>
                    <div className="border rounded-md p-4">
                      <EquityCurveChart result={result} />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">回撤曲線</h3>
                    <div className="border rounded-md p-4">
                      <DrawdownChart result={result} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">交易分布</h3>
                      <div className="border rounded-md p-4">
                        <TradeDistributionChart result={result} />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">盈虧分布</h3>
                      <div className="border rounded-md p-4">
                        <ProfitDistributionChart result={result} />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="trades">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">交易</th>
                        <th className="text-left py-2 px-4">方向</th>
                        <th className="text-left py-2 px-4">入場時間</th>
                        <th className="text-right py-2 px-4">入場價格</th>
                        <th className="text-left py-2 px-4">出場時間</th>
                        <th className="text-right py-2 px-4">出場價格</th>
                        <th className="text-right py-2 px-4">盈虧</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.trades.slice(0, 10).map((trade, index) => (
                        <tr key={trade.id} className="border-b">
                          <td className="py-2 px-4">{index + 1}</td>
                          <td className="py-2 px-4">
                            <span className={trade.direction === 'long' ? 'text-green-600' : 'text-red-600'}>
                              {trade.direction === 'long' ? '做多' : '做空'}
                            </span>
                          </td>
                          <td className="py-2 px-4">{new Date(trade.entryTime).toLocaleString()}</td>
                          <td className="text-right py-2 px-4">{trade.entryPrice.toFixed(2)}</td>
                          <td className="py-2 px-4">{new Date(trade.exitTime).toLocaleString()}</td>
                          <td className="text-right py-2 px-4">{trade.exitPrice.toFixed(2)}</td>
                          <td className={`text-right py-2 px-4 ${trade.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trade.netProfit.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="statistics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-2">交易統計</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">總交易次數</span>
                        <span>{result.performance.totalTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">獲利交易</span>
                        <span>{result.performance.winningTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">虧損交易</span>
                        <span>{result.performance.losingTrades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">勝率</span>
                        <span>{result.performance.winRate.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">盈虧比</span>
                        <span>{result.performance.profitFactor.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-2">盈虧統計</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">總淨盈虧</span>
                        <span className={result.performance.totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {result.performance.totalNetProfit.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">平均盈利</span>
                        <span className="text-green-600">{result.performance.averageProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">平均虧損</span>
                        <span className="text-red-600">{result.performance.averageLoss.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最大盈利</span>
                        <span className="text-green-600">{result.performance.largestProfit.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最大虧損</span>
                        <span className="text-red-600">{result.performance.largestLoss.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-2">風險統計</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最大回撤</span>
                        <span className="text-red-600">{result.performance.maxDrawdown.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最大回撤百分比</span>
                        <span className="text-red-600">{result.performance.maxDrawdownPct.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">恢復因子</span>
                        <span>{result.performance.recoveryFactor.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">夏普比率</span>
                        <span>{result.performance.sharpeRatio.toFixed(2)}</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-2">其他統計</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">年化收益率</span>
                        <span className={result.performance.annualReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {result.performance.annualReturn.toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">平均持倉時間</span>
                        <span>{result.performance.averageHoldingPeriod.toFixed(1)} 天</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-center gap-4">
        <Link href="/backtest">
          <Button variant="outline">
            修改參數
          </Button>
        </Link>
        
        <Button>
          <Play className="mr-2 h-4 w-4" />
          再次回測
        </Button>
      </div>
    </main>
  )
}
