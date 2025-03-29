'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'
import { StrategyRegistry } from '@/lib/strategies/registry'

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState(() => {
    const registry = StrategyRegistry.getInstance()
    return registry.getAllStrategies()
  })

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">交易策略</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-2">{strategy.name}</h2>
            <p className="text-muted-foreground mb-4 flex-grow">{strategy.description}</p>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">參數設置:</h3>
              <ul className="text-sm text-muted-foreground">
                {strategy.getParameters().map((param, index) => (
                  <li key={index}>• {param.name}: 預設值 {param.default}</li>
                ))}
              </ul>
            </div>
            <Link href={`/backtest?strategy=${strategy.id}`}>
              <Button className="w-full">使用此策略</Button>
            </Link>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center mb-4">
          <Info className="h-5 w-5 mr-2 text-blue-500" />
          <h2 className="text-xl font-semibold">策略說明</h2>
        </div>

        <Tabs defaultValue="basics">
          <TabsList className="mb-4">
            <TabsTrigger value="basics">基本概念</TabsTrigger>
            <TabsTrigger value="tips">使用技巧</TabsTrigger>
            <TabsTrigger value="custom">自定義策略</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basics">
            <div className="space-y-4">
              <p>
                交易策略是一套規則，用於決定何時進入或退出市場。好的交易策略應該具有明確的入場和出場條件，
                並且能夠在不同市場環境中保持一致性。
              </p>
              <p>
                在我們的回測系統中，每個策略都有特定的參數可以調整，以適應不同的市場條件和交易風格。
                通過回測，您可以評估策略在歷史數據上的表現，並優化參數以提高未來的交易效果。
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="tips">
            <div className="space-y-4">
              <p>
                <strong>1. 避免過度優化</strong> - 過度優化參數可能導致策略在歷史數據上表現良好，但在實際交易中失效。
                嘗試使用較長的回測期間，並確保策略在不同市場環境中都能保持穩定。
              </p>
              <p>
                <strong>2. 考慮交易成本</strong> - 在評估策略時，務必考慮交易成本（如手續費和滑點）的影響。
                頻繁交易的策略可能會因高交易成本而降低實際收益。
              </p>
              <p>
                <strong>3. 風險管理</strong> - 即使是最好的策略也會有虧損的時候。設置適當的止損和倉位大小，
                以控制每筆交易和整體投資組合的風險。
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="space-y-4">
              <p>
                我們的系統即將推出自定義策略功能，讓您能夠創建和測試自己的交易邏輯。
                您將能夠使用各種技術指標和條件組合來構建獨特的策略。
              </p>
              <p>
                自定義策略功能將支持以下功能：
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>多種技術指標（MA、RSI、MACD、布林帶等）</li>
                <li>自定義入場和出場條件</li>
                <li>複合條件邏輯（AND、OR、NOT）</li>
                <li>參數優化功能</li>
                <li>策略回測和性能分析</li>
              </ul>
              <p className="text-muted-foreground italic">
                敬請期待此功能的推出！
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </main>
  )
}
