'use client';

import { MarketSignal } from '@/lib/types';
import MarketRow from './MarketRow';

interface Props {
  signals: MarketSignal[];
}

export default function MarketTable({ signals }: Props) {
  if (signals.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📊</p>
        <p className="text-sm">No signals yet. Click &quot;Scan Markets&quot; to start.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">#</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Market</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase text-right">Market</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase text-right">Claude</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase text-right">Signal</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase text-center">Conf.</th>
            <th className="px-3 py-2 text-xs font-medium text-gray-400 uppercase text-right">Vol 24h</th>
            <th className="px-3 py-2 w-6"></th>
          </tr>
        </thead>
        <tbody>
          {signals.map((signal, i) => (
            <MarketRow key={signal.market.id} signal={signal} rank={i + 1} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
