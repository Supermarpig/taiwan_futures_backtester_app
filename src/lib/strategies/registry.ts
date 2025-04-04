import { Strategy } from './base';
import { MACrossoverStrategy } from './maCrossover';
import { RSIStrategy } from './rsiStrategy';
import { BreakoutStrategy } from './breakoutStrategy';
import { BollingerBandsStrategy } from './bollingerBandsStrategy';
import { MACDStrategy } from './macdStrategy';
import { DualMAStrategy } from './dualMAStrategy';
import { StrategyCombination } from './strategyCombination';

/**
 * 策略註冊表
 * 用於管理所有可用的策略
 */
export class StrategyRegistry {
  private static instance: StrategyRegistry;
  private strategies: Map<string, Strategy> = new Map();

  private constructor() {
    // 註冊內建策略
    this.registerStrategy(new MACrossoverStrategy());
    this.registerStrategy(new RSIStrategy());
    this.registerStrategy(new BreakoutStrategy());
    this.registerStrategy(new BollingerBandsStrategy());
    this.registerStrategy(new MACDStrategy());
    this.registerStrategy(new DualMAStrategy());
    
    // 註冊策略組合
    const trendStrategies = [
      new MACrossoverStrategy(),
      new MACDStrategy(),
      new DualMAStrategy()
    ];
    
    const meanReversionStrategies = [
      new RSIStrategy(),
      new BollingerBandsStrategy(),
      new BreakoutStrategy()
    ];
    
    this.registerStrategy(new StrategyCombination(trendStrategies));
    this.registerStrategy(new StrategyCombination(meanReversionStrategies));
    this.registerStrategy(new StrategyCombination([...trendStrategies, ...meanReversionStrategies]));
  }

  /**
   * 獲取策略註冊表實例（單例模式）
   */
  public static getInstance(): StrategyRegistry {
    if (!StrategyRegistry.instance) {
      StrategyRegistry.instance = new StrategyRegistry();
    }
    return StrategyRegistry.instance;
  }

  /**
   * 註冊策略
   * @param strategy 策略實例
   */
  public registerStrategy(strategy: Strategy): void {
    this.strategies.set(strategy.id, strategy);
  }

  /**
   * 獲取策略
   * @param id 策略ID
   * @returns 策略實例
   */
  public getStrategy(id: string): Strategy | undefined {
    return this.strategies.get(id);
  }

  /**
   * 獲取所有策略
   * @returns 所有策略的陣列
   */
  public getAllStrategies(): Strategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * 獲取策略的預設參數
   * @param id 策略ID
   * @returns 預設參數對象
   */
  public getDefaultParameters(id: string): any {
    const strategy = this.getStrategy(id);
    if (!strategy) {
      return {};
    }

    const params: any = {};
    strategy.getParameters().forEach(param => {
      params[param.id] = param.default;
    });

    return params;
  }
}

/**
 * 策略參數優化器
 * 用於尋找策略的最佳參數
 */
export class StrategyOptimizer {
  /**
   * 網格搜索優化
   * 對每個參數的可能值進行組合測試，找出最佳參數組合
   * @param strategy 策略
   * @param paramRanges 參數範圍
   * @param evaluateFunc 評估函數
   * @returns 最佳參數組合
   */
  public static gridSearch(
    strategy: Strategy,
    paramRanges: Record<string, { min: number; max: number; step: number }>,
    evaluateFunc: (params: any) => number
  ): { params: any; score: number } {
    let bestParams: any = {};
    let bestScore = -Infinity;

    // 生成參數網格
    const paramGrid = this.generateParamGrid(paramRanges);

    // 評估每個參數組合
    for (const params of paramGrid) {
      const score = evaluateFunc(params);
      if (score > bestScore) {
        bestScore = score;
        bestParams = { ...params };
      }
    }

    return { params: bestParams, score: bestScore };
  }

  /**
   * 生成參數網格
   * @param paramRanges 參數範圍
   * @returns 參數組合陣列
   */
  private static generateParamGrid(
    paramRanges: Record<string, { min: number; max: number; step: number }>
  ): any[] {
    const paramNames = Object.keys(paramRanges);
    const grid: any[] = [{}];

    paramNames.forEach(paramName => {
      const { min, max, step } = paramRanges[paramName];
      const newGrid: any[] = [];

      for (let value = min; value <= max; value += step) {
        grid.forEach(params => {
          newGrid.push({ ...params, [paramName]: value });
        });
      }

      grid.length = 0;
      grid.push(...newGrid);
    });

    return grid;
  }
}
