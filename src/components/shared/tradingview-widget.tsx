'use client';

import React, { useEffect, useRef } from 'react';

// ============================================================
// TradingView Widget Loader
// Carrega widgets públicos do TradingView via script injection
// https://www.tradingview.com/widget/
// ============================================================

interface TradingViewWidgetProps {
  type: 'market-overview' | 'ticker-tape' | 'symbol-info';
  symbols?: { s: string; d: string }[];
  height?: number;
}

const WIDGET_CONFIGS = {
  'market-overview': {
    scriptUrl: 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js',
    config: (symbols: { s: string; d: string }[]) => ({
      colorTheme: 'dark',
      showChart: true,
      locale: 'br',
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: true,
      width: '100%',
      height: '100%',
      plotLineColorGrowing: 'rgba(16, 185, 129, 1)',
      plotLineColorFalling: 'rgba(239, 68, 68, 1)',
      gridLineColor: 'rgba(42, 46, 57, 0.4)',
      scaleFontColor: 'rgba(120, 123, 134, 1)',
      belowLineFillColorGrowing: 'rgba(16, 185, 129, 0.06)',
      belowLineFillColorFalling: 'rgba(239, 68, 68, 0.06)',
      belowLineFillColorGrowingBottom: 'rgba(16, 185, 129, 0)',
      belowLineFillColorFallingBottom: 'rgba(239, 68, 68, 0)',
      symbolActiveColor: 'rgba(16, 185, 129, 0.12)',
      tabs: [
        {
          title: 'Crypto',
          symbols,
          originalTitle: 'Crypto',
        },
      ],
    }),
  },
  'ticker-tape': {
    scriptUrl: 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js',
    config: (symbols: { s: string; d: string }[]) => ({
      symbols,
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'br',
    }),
  },
  'symbol-info': {
    scriptUrl: 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js',
    config: () => ({
      symbols: [
        { proName: 'BINANCE:BTCUSDT', title: 'Bitcoin' },
        { proName: 'BINANCE:ETHUSDT', title: 'Ethereum' },
        { proName: 'BINANCE:SOLUSDT', title: 'Solana' },
      ],
      colorTheme: 'dark',
      isTransparent: true,
      locale: 'br',
    }),
  },
};

const DEFAULT_SYMBOLS = [
  { s: 'BINANCE:BTCUSDT', d: 'BTC/USDT' },
  { s: 'BINANCE:ETHUSDT', d: 'ETH/USDT' },
  { s: 'BINANCE:SOLUSDT', d: 'SOL/USDT' },
  { s: 'BINANCE:BNBUSDT', d: 'BNB/USDT' },
  { s: 'BINANCE:XRPUSDT', d: 'XRP/USDT' },
  { s: 'BINANCE:ADAUSDT', d: 'ADA/USDT' },
  { s: 'BINANCE:DOGEUSDT', d: 'DOGE/USDT' },
  { s: 'BINANCE:DOTUSDT', d: 'DOT/USDT' },
];

export default function TradingViewWidget({
  type,
  symbols = DEFAULT_SYMBOLS,
  height,
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetDef = WIDGET_CONFIGS[type];

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !widgetDef) return;

    // Clear previous content
    container.innerHTML = '';

    // Create widget container
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.appendChild(widgetDiv);

    // Create and inject script
    try {
      const script = document.createElement('script');
      script.src = widgetDef.scriptUrl;
      script.async = true;
      script.type = 'text/javascript';
      script.innerHTML = JSON.stringify(widgetDef.config(symbols));
      container.appendChild(script);
    } catch {
      // Widget failed to load — silently fail (fallback is the crypto cards)
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [type, symbols, widgetDef]);

  const style = type === 'ticker-tape'
    ? { width: '100%' }
    : { width: '100%', height: height || '100%' };

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={style}
    />
  );
}
