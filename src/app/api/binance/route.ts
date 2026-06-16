import { NextResponse } from 'next/server';

// ============================================================
// API Route: Proxy Binance Public API
// Permite obter dados de mercado sem CORS issues no cliente
// ============================================================

interface BinanceTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'DOTUSDT', 'AVAXUSDT', 'MATICUSDT'];

const MOCK_DATA: BinanceTicker[] = [
  { symbol: 'BTCUSDT', lastPrice: '67432.18', priceChangePercent: '2.34', highPrice: '68100.00', lowPrice: '65420.50', volume: '23456.78', quoteVolume: '1581234567.89' },
  { symbol: 'ETHUSDT', lastPrice: '3421.56', priceChangePercent: '1.12', highPrice: '3480.00', lowPrice: '3350.20', volume: '156789.12', quoteVolume: '536789012.34' },
  { symbol: 'SOLUSDT', lastPrice: '142.87', priceChangePercent: '-0.53', highPrice: '146.20', lowPrice: '140.10', volume: '5678901.23', quoteVolume: '812345678.90' },
  { symbol: 'BNBUSDT', lastPrice: '612.34', priceChangePercent: '0.87', highPrice: '618.50', lowPrice: '605.10', volume: '234567.89', quoteVolume: '143567890.12' },
  { symbol: 'XRPUSDT', lastPrice: '0.6234', priceChangePercent: '3.21', highPrice: '0.6350', lowPrice: '0.5980', volume: '123456789.01', quoteVolume: '76901234.56' },
  { symbol: 'ADAUSDT', lastPrice: '0.4512', priceChangePercent: '-1.05', highPrice: '0.4620', lowPrice: '0.4450', volume: '45678901.23', quoteVolume: '20612345.67' },
  { symbol: 'DOGEUSDT', lastPrice: '0.1234', priceChangePercent: '5.67', highPrice: '0.1260', lowPrice: '0.1150', volume: '2345678901.23', quoteVolume: '289456789.01' },
  { symbol: 'DOTUSDT', lastPrice: '5.678', priceChangePercent: '-0.23', highPrice: '5.780', lowPrice: '5.550', volume: '12345678.90', quoteVolume: '70123456.78' },
  { symbol: 'AVAXUSDT', lastPrice: '28.45', priceChangePercent: '2.89', highPrice: '29.10', lowPrice: '27.60', volume: '3456789.01', quoteVolume: '98345678.90' },
  { symbol: 'MATICUSDT', lastPrice: '0.5678', priceChangePercent: '1.45', highPrice: '0.5780', lowPrice: '0.5520', volume: '56789012.34', quoteVolume: '32234567.89' },
];

// Generate sparkline data (simulated price history)
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
  data[points - 1] = currentPrice; // Ensure last point is current price
  return data;
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const symbolsParam = JSON.stringify(SYMBOLS);
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 30 }, // Cache for 30 seconds
      }
    );

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`Binance API error: ${res.status}`);

    const tickers: BinanceTicker[] = await res.json();

    // Add sparkline data to each ticker
    const enriched = tickers.map((t) => ({
      ...t,
      sparkline: generateSparkline(parseFloat(t.lastPrice), parseFloat(t.priceChangePercent)),
    }));

    return NextResponse.json({ data: enriched, source: 'binance', timestamp: new Date().toISOString() });
  } catch {
    // Fallback to mock data
    console.log('[XPayments] Binance API unavailable, using mock data');
    const enriched = MOCK_DATA.map((t) => ({
      ...t,
      sparkline: generateSparkline(parseFloat(t.lastPrice), parseFloat(t.priceChangePercent)),
    }));

    return NextResponse.json({ data: enriched, source: 'mock', timestamp: new Date().toISOString() });
  }
}
