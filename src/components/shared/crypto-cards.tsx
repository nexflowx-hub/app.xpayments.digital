'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

// ============================================================
// Crypto Cards — Estilo Binance / KuCoin
// Dados da API pública Binance (via proxy) com fallback mock
// ============================================================

interface TickerData {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  sparkline: number[];
}

const CRYPTO_ICONS: Record<string, { icon: string; color: string; name: string }> = {
  BTCUSDT: { icon: '₿', color: 'text-amber-400', name: 'BTC' },
  ETHUSDT: { icon: 'Ξ', color: 'text-blue-400', name: 'ETH' },
  SOLUSDT: { icon: '◎', color: 'text-purple-400', name: 'SOL' },
  BNBUSDT: { icon: '◆', color: 'text-yellow-400', name: 'BNB' },
  XRPUSDT: { icon: '✕', color: 'text-slate-300', name: 'XRP' },
  ADAUSDT: { icon: '₳', color: 'text-cyan-400', name: 'ADA' },
  DOGEUSDT: { icon: 'Ð', color: 'text-yellow-300', name: 'DOGE' },
  DOTUSDT: { icon: '●', color: 'text-pink-400', name: 'DOT' },
  AVAXUSDT: { icon: '▲', color: 'text-red-400', name: 'AVAX' },
  MATICUSDT: { icon: '⬡', color: 'text-violet-400', name: 'MATIC' },
};

// Inline mock data (used when API is unreachable)
function generateSparkline(currentPrice: number, changePercent: number): number[] {
  const points = 24;
  const data: number[] = [];
  const startPrice = currentPrice / (1 + changePercent / 100);
  const volatility = currentPrice * 0.008;
  for (let i = 0; i < points; i++) {
    const trend = (currentPrice - startPrice) * (i / points);
    const noise = (Math.random() - 0.5) * volatility * 2;
    data.push(startPrice + trend + noise);
  }
  data[points - 1] = currentPrice;
  return data;
}

const FALLBACK_DATA: TickerData[] = [
  { symbol: 'BTCUSDT', lastPrice: '67432.18', priceChangePercent: '2.34', highPrice: '68100.00', lowPrice: '65420.50', volume: '23456.78', quoteVolume: '1581234567.89', sparkline: [] },
  { symbol: 'ETHUSDT', lastPrice: '3421.56', priceChangePercent: '1.12', highPrice: '3480.00', lowPrice: '3350.20', volume: '156789.12', quoteVolume: '536789012.34', sparkline: [] },
  { symbol: 'SOLUSDT', lastPrice: '142.87', priceChangePercent: '-0.53', highPrice: '146.20', lowPrice: '140.10', volume: '5678901.23', quoteVolume: '812345678.90', sparkline: [] },
  { symbol: 'BNBUSDT', lastPrice: '612.34', priceChangePercent: '0.87', highPrice: '618.50', lowPrice: '605.10', volume: '234567.89', quoteVolume: '143567890.12', sparkline: [] },
  { symbol: 'XRPUSDT', lastPrice: '0.6234', priceChangePercent: '3.21', highPrice: '0.6350', lowPrice: '0.5980', volume: '123456789.01', quoteVolume: '76901234.56', sparkline: [] },
  { symbol: 'ADAUSDT', lastPrice: '0.4512', priceChangePercent: '-1.05', highPrice: '0.4620', lowPrice: '0.4450', volume: '45678901.23', quoteVolume: '20612345.67', sparkline: [] },
  { symbol: 'DOGEUSDT', lastPrice: '0.1234', priceChangePercent: '5.67', highPrice: '0.1260', lowPrice: '0.1150', volume: '2345678901.23', quoteVolume: '289456789.01', sparkline: [] },
  { symbol: 'DOTUSDT', lastPrice: '5.678', priceChangePercent: '-0.23', highPrice: '5.780', lowPrice: '5.550', volume: '12345678.90', quoteVolume: '70123456.78', sparkline: [] },
  { symbol: 'AVAXUSDT', lastPrice: '28.45', priceChangePercent: '2.89', highPrice: '29.10', lowPrice: '27.60', volume: '3456789.01', quoteVolume: '98345678.90', sparkline: [] },
].map(t => ({ ...t, sparkline: generateSparkline(parseFloat(t.lastPrice), parseFloat(t.priceChangePercent)) }));

// Mini Sparkline SVG
function Sparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 32;
  const padding = 2;

  const points = data.map((val, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
  const color = isPositive ? '#10b981' : '#ef4444';
  const gradientId = `spark-${isPositive ? 'up' : 'down'}-${Math.random().toString(36).slice(2)}`;

  return (
    <svg width={width} height={height} className="shrink-0" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradientId})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatPrice(price: string): string {
  const num = parseFloat(price);
  if (num >= 1000) return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (num >= 1) return `$${num.toFixed(4)}`;
  return `$${num.toFixed(6)}`;
}

function formatVolume(vol: string): string {
  const num = parseFloat(vol);
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

// Single Crypto Card
function CryptoCard({ ticker, index }: { ticker: TickerData; index: number }) {
  const changePercent = parseFloat(ticker.priceChangePercent);
  const isPositive = changePercent >= 0;
  const meta = CRYPTO_ICONS[ticker.symbol] || { icon: '•', color: 'text-zinc-400', name: ticker.symbol.replace('USDT', '') };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border p-4 transition-all duration-300',
        'bg-zinc-900/60 border-zinc-800/60 backdrop-blur-sm',
        'hover:border-neon-500/30 hover:bg-zinc-900/80 hover:shadow-lg hover:shadow-neon-500/5',
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-neon-500/5 blur-3xl" />
      </div>

      {/* Header: Symbol + Change */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/50">
            <span className={cn('text-base font-bold', meta.color)}>{meta.icon}</span>
          </div>
          <div>
            <span className="text-sm font-semibold text-zinc-100">{meta.name}</span>
            <span className="text-[10px] text-zinc-500 ml-1.5">/ USDT</span>
          </div>
        </div>

        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold',
          isPositive ? 'bg-neon-500/15 text-neon-400' : 'bg-red-500/15 text-red-400',
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>

      {/* Price */}
      <div className="mb-3">
        <span className="text-xl font-bold text-zinc-50 tabular-nums tracking-tight">
          {formatPrice(ticker.lastPrice)}
        </span>
      </div>

      {/* Sparkline */}
      <div className="mb-3 flex justify-end opacity-70 group-hover:opacity-100 transition-opacity">
        <Sparkline data={ticker.sparkline} isPositive={isPositive} />
      </div>

      {/* Bottom stats */}
      <div className="flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-800/50 pt-2">
        <div className="flex gap-3">
          <span>
            <span className="text-zinc-600">H: </span>
            <span className="text-zinc-400 tabular-nums">{formatPrice(ticker.highPrice)}</span>
          </span>
          <span>
            <span className="text-zinc-600">L: </span>
            <span className="text-zinc-400 tabular-nums">{formatPrice(ticker.lowPrice)}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-zinc-600" />
          <span className="text-zinc-400 tabular-nums">{formatVolume(ticker.quoteVolume)}</span>
        </div>
      </div>
    </div>
  );
}

// Scrolling Ticker Tape
function TickerTape({ tickers }: { tickers: TickerData[] }) {
  const doubled = [...tickers, ...tickers];

  return (
    <div className="relative overflow-hidden border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm rounded-xl">
      <div className="flex animate-ticker-scroll">
        {doubled.map((ticker, i) => {
          const changePercent = parseFloat(ticker.priceChangePercent);
          const isPositive = changePercent >= 0;
          const meta = CRYPTO_ICONS[ticker.symbol] || { icon: '•', color: 'text-zinc-400', name: ticker.symbol.replace('USDT', '') };

          return (
            <div
              key={`${ticker.symbol}-${i}`}
              className="flex items-center gap-2 px-6 py-2.5 shrink-0 border-r border-zinc-800/30"
            >
              <span className={cn('text-sm font-semibold', meta.color)}>{meta.icon}</span>
              <span className="text-xs font-medium text-zinc-300">{meta.name}</span>
              <span className="text-xs font-semibold text-zinc-100 tabular-nums">
                {formatPrice(ticker.lastPrice)}
              </span>
              <span className={cn(
                'text-[10px] font-semibold px-1.5 py-0.5 rounded',
                isPositive ? 'text-neon-400 bg-neon-500/10' : 'text-red-400 bg-red-500/10',
              )}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Main Crypto Cards Grid
export default function CryptoCards() {
  const [tickers, setTickers] = useState<TickerData[]>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>('fallback');

  const fetchTickers = useCallback(async () => {
    try {
      const res = await fetch('/api/binance');
      if (!res.ok) throw new Error('Failed');
      const data = { data: [] as TickerData[], source: 'binance' as string };
      try {
        const parsed = await res.json();
        if (parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0) {
          setTickers(parsed.data);
          setSource(parsed.source || 'binance');
        } else {
          throw new Error('Empty data');
        }
      } catch {
        throw new Error('Invalid JSON');
      }
    } catch {
      setTickers(FALLBACK_DATA);
      setSource('fallback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickers();
    const interval = setInterval(fetchTickers, 30000);
    return () => clearInterval(interval);
  }, [fetchTickers]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-zinc-900/40 animate-pulse rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-zinc-900/40 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TickerTape tickers={tickers.slice(0, 8)} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {tickers.map((ticker, i) => (
          <CryptoCard key={ticker.symbol} ticker={ticker} index={i} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2">
        <div className={cn(
          'w-1.5 h-1.5 rounded-full',
          source === 'binance' ? 'bg-neon-400' : 'bg-amber-400',
        )} />
        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
          {source === 'binance' ? 'Live Binance' : 'Dados Simulados'}
        </span>
      </div>
    </div>
  );
}
