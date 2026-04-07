'use client';

import { useState, useMemo } from 'react';
import { useMarketScan } from '@/hooks/useMarketScan';
import { findConditionalConflicts } from '@/lib/strategies/conditional';
import MarketTable from '@/components/MarketTable';
import FilterBar from '@/components/FilterBar';
import ScanButton from '@/components/ScanButton';
import { MarketSignal } from '@/lib/types';

export default function Home() {
  const { state, scan } = useMarketScan();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minDelta, setMinDelta] = useState(0.05);
  const [hideNoise, setHideNoise] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(state.markets.map((m) => m.category));
    return Array.from(cats).sort();
  }, [state.markets]);

  const filteredSignals = useMemo((): MarketSignal[] => {
    return state.signals.filter((s) => {
      if (selectedCategory !== 'all' && s.market.category !== selectedCategory) return false;
      if (s.absDelta < minDelta) return false;
      if (hideNoise && s.absDelta < 0.1) return false;
      return true;
    });
  }, [state.signals, selectedCategory, minDelta, hideNoise]);

  const conflicts = useMemo(() => {
    if (state.markets.length < 2) return [];
    return findConditionalConflicts(state.markets);
  }, [state.markets]);

  const strongSignals = filteredSignals.filter((s) => s.absDelta >= 0.2).length;
  const calibrationHits = filteredSignals.filter((s) => s.calibrationFlag).length;
  const decayHits = filteredSignals.filter((s) => s.timeDecayFlag).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Polymarket Signal Scanner</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Strategies: Base Rate · Conditional Math · Calibration Bias · Time Decay
            </p>
          </div>
          <ScanButton
            status={state.status}
            progressLabel={state.progressLabel}
            progress={state.progress}
            onScan={scan}
          />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-5">
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800">
          <strong>Not financial advice.</strong> Claude&apos;s estimates are based on training data — not live news.
          Always verify signals manually before trading. Prediction markets carry real financial risk.
        </div>

        {/* Stats row */}
        {state.status === 'complete' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Markets scanned', value: state.markets.length },
              { label: 'Signals found', value: filteredSignals.length },
              { label: 'Strong (>20%)', value: strongSignals },
              { label: 'Calibration / Decay flags', value: calibrationHits + decayHits },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            Error: {state.error}
          </div>
        )}

        {/* Filter bar */}
        {state.signals.length > 0 && (
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            minDelta={minDelta}
            hideNoise={hideNoise}
            onCategoryChange={setSelectedCategory}
            onMinDeltaChange={setMinDelta}
            onHideNoiseChange={setHideNoise}
          />
        )}

        {/* Main signals table */}
        <MarketTable signals={filteredSignals} />

        {/* Strategy 2: Conditional conflicts */}
        {conflicts.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Conditional Probability Conflicts ({conflicts.length})
            </h2>
            <div className="space-y-2">
              {conflicts.map((c, i) => (
                <div
                  key={i}
                  className="bg-white border border-yellow-200 rounded-lg px-4 py-3 text-xs text-gray-600"
                >
                  <span className="text-yellow-600 font-semibold mr-2">MATH CONFLICT</span>
                  {c.description}
                  <span className="ml-2 text-gray-400">
                    (implied conditional: {(c.impliedConditional * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
