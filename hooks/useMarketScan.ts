'use client';

import { useState, useCallback } from 'react';
import { ScanState, PolymarketMarket, ClaudeAnalysis } from '@/lib/types';
import { buildSignal, sortSignals } from '@/lib/utils';

const BATCH_SIZE = 5;

const initialState: ScanState = {
  status: 'idle',
  markets: [],
  signals: [],
  progress: 0,
  progressLabel: '',
  error: null,
};

export function useMarketScan() {
  const [state, setState] = useState<ScanState>(initialState);

  const scan = useCallback(async () => {
    setState({ ...initialState, status: 'fetching-markets', progressLabel: 'Fetching markets...' });

    // Step 1: fetch markets
    let markets: PolymarketMarket[];
    try {
      const res = await fetch('/api/markets');
      if (!res.ok) throw new Error(`Markets fetch failed: ${res.status}`);
      markets = await res.json();
    } catch (err) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to fetch markets',
      }));
      return;
    }

    if (markets.length === 0) {
      setState((s) => ({ ...s, status: 'error', error: 'No markets returned from Polymarket' }));
      return;
    }

    setState((s) => ({
      ...s,
      status: 'analyzing',
      markets,
      progressLabel: `Analyzing 0 of ${markets.length}...`,
      progress: 5,
    }));

    // Step 2: analyze in batches
    const allSignals: ReturnType<typeof buildSignal>[] = [];
    const totalBatches = Math.ceil(markets.length / BATCH_SIZE);

    for (let b = 0; b < totalBatches; b++) {
      const batch = markets.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
      const analyzed = (b * BATCH_SIZE);

      setState((s) => ({
        ...s,
        progressLabel: `Analyzing ${analyzed} of ${markets.length}...`,
        progress: 5 + Math.round((analyzed / markets.length) * 90),
      }));

      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batch),
        });
        if (!res.ok) throw new Error(`Analyze failed: ${res.status}`);

        const results: Array<{ id: string; analysis: ClaudeAnalysis | null; error?: string }> =
          await res.json();

        for (const result of results) {
          if (!result.analysis) continue;
          const market = markets.find((m) => m.id === result.id);
          if (!market) continue;
          allSignals.push(buildSignal(market, result.analysis));
        }

        setState((s) => ({
          ...s,
          signals: sortSignals(allSignals),
        }));
      } catch (err) {
        // Don't abort the whole scan on a single batch failure
        console.error(`Batch ${b} failed:`, err);
      }
    }

    setState((s) => ({
      ...s,
      status: 'complete',
      progress: 100,
      progressLabel: `Done — ${allSignals.length} signals`,
      signals: sortSignals(allSignals),
    }));
  }, []);

  return { state, scan };
}
