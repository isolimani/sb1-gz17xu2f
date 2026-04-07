import { PolymarketMarket } from './types';

const GAMMA_API = 'https://gamma-api.polymarket.com';
const MIN_LIQUIDITY = Number(process.env.MIN_LIQUIDITY_USD ?? 1000);
const MAX_MARKETS = Number(process.env.MAX_MARKETS_PER_SCAN ?? 20);

interface GammaMarket {
  id: string;
  question: string;
  description?: string;
  endDate?: string;
  endDateIso?: string;
  category?: string;
  outcomePrices?: string; // JSON-encoded string e.g. '["0.73", "0.27"]'
  volume24hr?: number | string;
  liquidityNum?: number | string;
  liquidity?: number | string;
  active?: boolean;
  closed?: boolean;
}

function parseYesPrice(raw: GammaMarket): number {
  try {
    if (!raw.outcomePrices) return 0.5;
    const prices: string[] = JSON.parse(raw.outcomePrices);
    return Math.min(0.99, Math.max(0.01, parseFloat(prices[0])));
  } catch {
    return 0.5;
  }
}

function parseLiquidity(raw: GammaMarket): number {
  const val = raw.liquidityNum ?? raw.liquidity ?? 0;
  return typeof val === 'string' ? parseFloat(val) : val;
}

function parseVolume(raw: GammaMarket): number {
  const val = raw.volume24hr ?? 0;
  return typeof val === 'string' ? parseFloat(val) : val;
}

export async function fetchMarkets(): Promise<PolymarketMarket[]> {
  const url = new URL(`${GAMMA_API}/markets`);
  url.searchParams.set('active', 'true');
  url.searchParams.set('closed', 'false');
  url.searchParams.set('limit', String(MAX_MARKETS * 3)); // fetch extra, then filter
  url.searchParams.set('order', 'volume24hr');
  url.searchParams.set('ascending', 'false');

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    throw new Error(`Polymarket API error: ${res.status} ${res.statusText}`);
  }

  const raw: GammaMarket[] = await res.json();

  return raw
    .filter((m) => {
      if (m.closed || !m.active) return false;
      if (parseLiquidity(m) < MIN_LIQUIDITY) return false;
      if (!m.question || !m.outcomePrices) return false;
      return true;
    })
    .slice(0, MAX_MARKETS)
    .map((m): PolymarketMarket => ({
      id: m.id,
      question: m.question,
      description: m.description ?? '',
      endDate: m.endDateIso ?? m.endDate ?? '',
      category: m.category ?? 'General',
      yesPrice: parseYesPrice(m),
      volume24h: parseVolume(m),
      liquidity: parseLiquidity(m),
    }));
}
