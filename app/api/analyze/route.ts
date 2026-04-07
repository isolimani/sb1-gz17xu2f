import { NextRequest, NextResponse } from 'next/server';
import { analyzeMarket } from '@/lib/claude';
import { PolymarketMarket, ClaudeAnalysis } from '@/lib/types';

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  try {
    const markets: PolymarketMarket[] = await req.json();

    if (!Array.isArray(markets) || markets.length === 0) {
      return NextResponse.json({ error: 'No markets provided' }, { status: 400 });
    }

    const results: Array<{ id: string; analysis: ClaudeAnalysis | null; error?: string }> = [];

    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      try {
        const analysis = await analyzeMarket(market);
        results.push({ id: market.id, analysis });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Analysis failed';
        results.push({ id: market.id, analysis: null, error: message });
      }
      // Rate limit: 1 request per second to avoid 429s
      if (i < markets.length - 1) {
        await sleep(1000);
      }
    }

    return NextResponse.json(results);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
