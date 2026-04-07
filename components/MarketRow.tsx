'use client';

import { useState } from 'react';
import { MarketSignal } from '@/lib/types';
import { formatPct, formatDelta, formatVolume } from '@/lib/utils';
import SignalBadge from './SignalBadge';

interface Props {
  signal: MarketSignal;
  rank: number;
}

const confidenceColors = {
  low: 'text-gray-400',
  medium: 'text-yellow-600',
  high: 'text-green-600',
};

export default function MarketRow({ signal, rank }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { market, analysis, delta, absDelta, direction, calibrationFlag, timeDecayFlag, timeDecayPerDay } = signal;

  return (
    <>
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Rank */}
        <td className="px-3 py-3 text-sm text-gray-400 font-mono w-8">
          {rank}
        </td>

        {/* Question */}
        <td className="px-3 py-3 text-sm text-gray-800 max-w-xs">
          <div className="truncate" title={market.question}>
            {market.question}
          </div>
          <div className="flex gap-1 mt-1 flex-wrap">
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              {market.category}
            </span>
            {calibrationFlag && (
              <span className="text-xs text-purple-700 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded font-medium">
                BIAS
              </span>
            )}
            {timeDecayFlag && (
              <span className="text-xs text-orange-700 bg-orange-100 border border-orange-200 px-1.5 py-0.5 rounded font-medium">
                -{(timeDecayPerDay * 100).toFixed(2)}%/day
              </span>
            )}
          </div>
        </td>

        {/* Market Price */}
        <td className="px-3 py-3 text-sm font-mono text-gray-700 text-right">
          {formatPct(market.yesPrice)}
        </td>

        {/* Claude Estimate */}
        <td className="px-3 py-3 text-sm font-mono text-gray-700 text-right">
          {formatPct(analysis.probability)}
        </td>

        {/* Delta + Signal */}
        <td className="px-3 py-3 text-sm text-right">
          <SignalBadge absDelta={absDelta} direction={direction} deltaLabel={formatDelta(delta)} />
        </td>

        {/* Confidence */}
        <td className={`px-3 py-3 text-xs font-medium text-center ${confidenceColors[analysis.confidence]}`}>
          {analysis.confidence.toUpperCase()}
        </td>

        {/* Volume */}
        <td className="px-3 py-3 text-xs text-gray-400 text-right font-mono">
          {formatVolume(market.volume24h)}
        </td>

        {/* Expand */}
        <td className="px-3 py-3 text-gray-400 text-sm text-center">
          {expanded ? '▲' : '▼'}
        </td>
      </tr>

      {expanded && (
        <tr className="bg-blue-50 border-b border-blue-100">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-1">Claude&apos;s Reasoning</p>
                <p className="text-gray-600 leading-relaxed">{analysis.reasoning}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-1">Data Limitations</p>
                <p className="text-gray-500 leading-relaxed">{analysis.dataLimitations}</p>
              </div>
            </div>
            {market.description && (
              <div className="mt-3">
                <p className="font-semibold text-gray-700 mb-1 text-sm">Market Description</p>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">{market.description}</p>
              </div>
            )}
            <div className="mt-3 flex gap-4 text-xs text-gray-400">
              <span>Closes: {market.endDate ? new Date(market.endDate).toLocaleDateString() : 'N/A'}</span>
              <span>Liquidity: {formatVolume(market.liquidity)}</span>
              <span>Scanned: {new Date(signal.scannedAt).toLocaleTimeString()}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
