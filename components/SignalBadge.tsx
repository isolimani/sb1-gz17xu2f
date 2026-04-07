'use client';

import { signalStrength } from '@/lib/utils';

interface Props {
  absDelta: number;
  direction: 'overpriced' | 'underpriced';
  deltaLabel: string;
}

const strengthClasses = {
  strong: {
    overpriced: 'bg-red-100 text-red-700 border border-red-300',
    underpriced: 'bg-green-100 text-green-700 border border-green-300',
  },
  moderate: {
    overpriced: 'bg-orange-100 text-orange-700 border border-orange-300',
    underpriced: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
  },
  noise: {
    overpriced: 'bg-gray-100 text-gray-500 border border-gray-200',
    underpriced: 'bg-gray-100 text-gray-500 border border-gray-200',
  },
};

export default function SignalBadge({ absDelta, direction, deltaLabel }: Props) {
  const strength = signalStrength(absDelta);
  const cls = strengthClasses[strength][direction];
  const arrow = direction === 'underpriced' ? '↑' : '↓';
  const label = direction === 'underpriced' ? 'UNDERPRICED' : 'OVERPRICED';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {arrow} {deltaLabel} {label}
    </span>
  );
}
