import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { BacktestResult } from '@/lib/backtest/types';

// 註冊所有Chart.js組件
Chart.register(...registerables);

interface EquityCurveChartProps {
  result: BacktestResult;
}

export function EquityCurveChart({ result }: EquityCurveChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !result) return;

    // 如果已經有圖表實例，先銷毀
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 準備數據
    const labels = result.equity.map(point => 
      new Date(point.timestamp).toLocaleDateString()
    );
    
    const equityData = result.equity.map(point => point.equity);
    
    // 找出最大值和最小值，用於設置y軸範圍
    const minEquity = Math.min(...equityData);
    const maxEquity = Math.max(...equityData);
    const padding = (maxEquity - minEquity) * 0.1;

    // 創建圖表
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '權益曲線',
            data: equityData,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `權益: ${context.parsed.y.toLocaleString()} 元`;
              }
            }
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxTicksLimit: 10,
              maxRotation: 0,
            }
          },
          y: {
            min: minEquity - padding,
            max: maxEquity + padding,
            ticks: {
              callback: function(value) {
                return value.toLocaleString();
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    // 清理函數
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [result]);

  return (
    <div className="w-full h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

interface DrawdownChartProps {
  result: BacktestResult;
}

export function DrawdownChart({ result }: DrawdownChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !result) return;

    // 如果已經有圖表實例，先銷毀
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 準備數據
    const labels = result.drawdowns.map(point => 
      new Date(point.timestamp).toLocaleDateString()
    );
    
    const drawdownData = result.drawdowns.map(point => -point.drawdownPct); // 負值，表示回撤
    
    // 找出最小值，用於設置y軸範圍
    const minDrawdown = Math.min(...drawdownData);
    const padding = Math.abs(minDrawdown) * 0.1;

    // 創建圖表
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '回撤百分比',
            data: drawdownData,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `回撤: ${Math.abs(context.parsed.y).toFixed(2)}%`;
              }
            }
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxTicksLimit: 10,
              maxRotation: 0,
            }
          },
          y: {
            min: minDrawdown - padding,
            max: 0,
            ticks: {
              callback: function(value) {
                return `${Math.abs(Number(value)).toFixed(2)}%`;
              }
            }
          }
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        }
      }
    });

    // 清理函數
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [result]);

  return (
    <div className="w-full h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

interface TradeDistributionChartProps {
  result: BacktestResult;
}

export function TradeDistributionChart({ result }: TradeDistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !result) return;

    // 如果已經有圖表實例，先銷毀
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 準備數據
    const winningTrades = result.trades.filter(trade => trade.netProfit > 0).length;
    const losingTrades = result.trades.filter(trade => trade.netProfit <= 0).length;
    
    // 創建圖表
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['獲利交易', '虧損交易'],
        datasets: [
          {
            data: [winningTrades, losingTrades],
            backgroundColor: [
              'rgba(34, 197, 94, 0.7)',
              'rgba(239, 68, 68, 0.7)'
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(239, 68, 68)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          },
          legend: {
            position: 'top',
          },
        }
      }
    });

    // 清理函數
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [result]);

  return (
    <div className="w-full h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

interface ProfitDistributionChartProps {
  result: BacktestResult;
}

export function ProfitDistributionChart({ result }: ProfitDistributionChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !result) return;

    // 如果已經有圖表實例，先銷毀
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 準備數據
    const profitData = result.trades.map(trade => trade.netProfit);
    
    // 創建直方圖的區間
    const min = Math.min(...profitData);
    const max = Math.max(...profitData);
    const range = max - min;
    const binCount = 10;
    const binSize = range / binCount;
    
    const bins = Array(binCount).fill(0);
    const binLabels = [];
    
    for (let i = 0; i < binCount; i++) {
      const lowerBound = min + i * binSize;
      const upperBound = min + (i + 1) * binSize;
      binLabels.push(`${lowerBound.toFixed(0)} - ${upperBound.toFixed(0)}`);
    }
    
    profitData.forEach(profit => {
      if (profit === max) {
        bins[binCount - 1]++;
      } else {
        const binIndex = Math.floor((profit - min) / binSize);
        bins[binIndex]++;
      }
    });
    
    // 創建圖表
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: binLabels,
        datasets: [
          {
            label: '交易盈虧分布',
            data: bins,
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                return `交易次數: ${context.parsed.y}`;
              }
            }
          },
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    // 清理函數
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [result]);

  return (
    <div className="w-full h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
