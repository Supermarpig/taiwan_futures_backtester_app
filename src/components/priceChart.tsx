import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { BacktestResult } from '@/lib/backtest/types';
import { MarketData } from '@/lib/api/yahooFinance';

// 註冊所有Chart.js組件
Chart.register(...registerables);

interface PriceChartWithTradesProps {
  marketData: MarketData;
  result: BacktestResult;
}

export function PriceChartWithTrades({ marketData, result }: PriceChartWithTradesProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || !marketData || !result) return;

    // 如果已經有圖表實例，先銷毀
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 準備數據
    const labels = marketData.timestamp.map(ts => 
      new Date(ts).toLocaleDateString()
    );
    
    const priceData = marketData.close;
    
    // 找出交易的買入和賣出點
    const buyPoints = result.trades.map(trade => {
      const index = marketData.timestamp.findIndex(ts => ts === trade.entryTime);
      return index >= 0 && trade.direction === 'long' ? priceData[index] : null;
    });
    
    const sellPoints = result.trades.map(trade => {
      const index = marketData.timestamp.findIndex(ts => ts === trade.exitTime);
      return index >= 0 && trade.direction === 'long' ? priceData[index] : null;
    });
    
    const shortPoints = result.trades.map(trade => {
      const index = marketData.timestamp.findIndex(ts => ts === trade.entryTime);
      return index >= 0 && trade.direction === 'short' ? priceData[index] : null;
    });
    
    const coverPoints = result.trades.map(trade => {
      const index = marketData.timestamp.findIndex(ts => ts === trade.exitTime);
      return index >= 0 && trade.direction === 'short' ? priceData[index] : null;
    });
    
    // 創建圖表
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '價格',
            data: priceData,
            borderColor: 'rgb(75, 85, 99)',
            backgroundColor: 'rgba(75, 85, 99, 0.1)',
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 3,
            fill: false,
            tension: 0.1,
          },
          {
            label: '買入點',
            data: buyPoints,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgb(34, 197, 94)',
            pointRadius: 5,
            pointStyle: 'triangle',
            showLine: false,
          },
          {
            label: '賣出點',
            data: sellPoints,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgb(239, 68, 68)',
            pointRadius: 5,
            pointStyle: 'triangle',
            rotation: 180,
            showLine: false,
          },
          {
            label: '做空點',
            data: shortPoints,
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgb(239, 68, 68)',
            pointRadius: 5,
            pointStyle: 'triangle',
            rotation: 180,
            showLine: false,
          },
          {
            label: '平空點',
            data: coverPoints,
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgb(34, 197, 94)',
            pointRadius: 5,
            pointStyle: 'triangle',
            showLine: false,
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
  }, [marketData, result]);

  return (
    <div className="w-full h-64">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
