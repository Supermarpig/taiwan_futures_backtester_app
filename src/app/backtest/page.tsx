'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Play, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { StrategyRegistry } from '@/lib/strategies/registry'
import { Strategy } from '@/lib/strategies/base'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhTW } from 'date-fns/locale'

export default function BacktestPage() {
  const router = useRouter()
  const [symbol, setSymbol] = useState('')
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [initialCapital, setInitialCapital] = useState('1000000')
  const [positionSize, setPositionSize] = useState('10')
  const [commissionRate, setCommissionRate] = useState('0.1425')
  const [slippage, setSlippage] = useState('0.1')
  const [selectedStrategy, setSelectedStrategy] = useState('')
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [strategyParams, setStrategyParams] = useState<any>({})
  
  // 載入策略列表
  useEffect(() => {
    const registry = StrategyRegistry.getInstance()
    const allStrategies = registry.getAllStrategies()
    setStrategies(allStrategies)
  }, [])
  
  // 當選擇策略時，載入預設參數
  useEffect(() => {
    if (selectedStrategy) {
      const registry = StrategyRegistry.getInstance()
      const defaultParams = registry.getDefaultParameters(selectedStrategy)
      setStrategyParams(defaultParams)
    }
  }, [selectedStrategy])
  
  // 處理參數變更
  const handleParamChange = (paramId: string, value: any) => {
    setStrategyParams(prev => ({
      ...prev,
      [paramId]: value
    }))
  }
  
  // 處理回測表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // 驗證表單
    if (!symbol || !startDate || !endDate || !selectedStrategy) {
      alert('請填寫所有必填欄位')
      return
    }
    
    // 在實際應用中，這裡應該發送回測請求到後端
    // 目前直接導航到結果頁面進行模擬
    router.push(`/backtest/result/mock-id`)
  }
  
  // 獲取當前選擇的策略
  const getCurrentStrategy = () => {
    if (!selectedStrategy) return null
    return strategies.find(s => s.id === selectedStrategy)
  }
  
  const currentStrategy = getCurrentStrategy()
  
  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="flex items-center mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">回測設置</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">回測參數</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol">股票/期貨代碼</Label>
                  <Input 
                    id="symbol" 
                    placeholder="例如: 2330.TW, TXFF" 
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="startDate">開始日期</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'yyyy/MM/dd', { locale: zhTW }) : "選擇開始日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="endDate">結束日期</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'yyyy/MM/dd', { locale: zhTW }) : "選擇結束日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="initialCapital">初始資金</Label>
                  <Input 
                    id="initialCapital" 
                    type="number" 
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="positionSize">倉位大小 (%)</Label>
                  <Input 
                    id="positionSize" 
                    type="number" 
                    value={positionSize}
                    onChange={(e) => setPositionSize(e.target.value)}
                    min="1"
                    max="100"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="commissionRate">手續費率 (%)</Label>
                  <Input 
                    id="commissionRate" 
                    type="number" 
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    step="0.0001"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slippage">滑點 (%)</Label>
                  <Input 
                    id="slippage" 
                    type="number" 
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="strategy">選擇策略</Label>
                  <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                    <SelectTrigger id="strategy">
                      <SelectValue placeholder="選擇交易策略" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map(strategy => (
                        <SelectItem key={strategy.id} value={strategy.id}>
                          {strategy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={!symbol || !startDate || !endDate || !selectedStrategy}
                >
                  <Play className="mr-2 h-4 w-4" />
                  開始回測
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="p-6 h-full">
              <Tabs defaultValue="parameters">
                <TabsList className="mb-4">
                  <TabsTrigger value="parameters">策略參數</TabsTrigger>
                  <TabsTrigger value="description">策略說明</TabsTrigger>
                </TabsList>
                
                <TabsContent value="parameters" className="space-y-4">
                  {currentStrategy ? (
                    <>
                      {currentStrategy.getParameters().map(param => (
                        <div key={param.id}>
                          <Label htmlFor={param.id}>{param.name}</Label>
                          {param.type === 'number' ? (
                            <Input 
                              id={param.id} 
                              type="number" 
                              value={strategyParams[param.id] || param.default}
                              onChange={(e) => handleParamChange(param.id, parseFloat(e.target.value))}
                              min={param.min}
                              max={param.max}
                              step={param.step}
                            />
                          ) : param.type === 'boolean' ? (
                            <Select 
                              value={String(strategyParams[param.id] || param.default)}
                              onValueChange={(value) => handleParamChange(param.id, value === 'true')}
                            >
                              <SelectTrigger id={param.id}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">是</SelectItem>
                                <SelectItem value="false">否</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : param.type === 'select' && param.options ? (
                            <Select 
                              value={String(strategyParams[param.id] || param.default)}
                              onValueChange={(value) => handleParamChange(param.id, value)}
                            >
                              <SelectTrigger id={param.id}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {param.options.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input 
                              id={param.id} 
                              value={strategyParams[param.id] || param.default}
                              onChange={(e) => handleParamChange(param.id, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-muted-foreground">請先選擇策略</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="description">
                  {currentStrategy ? (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">{currentStrategy.name}</h3>
                      <p>{currentStrategy.description}</p>
                      
                      <h4 className="font-medium mt-4">參數說明:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {currentStrategy.getParameters().map(param => (
                          <li key={param.id}>
                            <strong>{param.name}</strong>: 
                            {param.type === 'number' ? 
                              ` 數值範圍 ${param.min} - ${param.max}，預設值 ${param.default}` : 
                              ` 預設值 ${param.default}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p className="text-muted-foreground">請先選擇策略</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </form>
    </main>
  )
}
