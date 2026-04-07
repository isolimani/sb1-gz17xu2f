'use client';

import { ScanStatus } from '@/lib/types';

interface Props {
  status: ScanStatus;
  progressLabel: string;
  progress: number;
  onScan: () => void;
}

export default function ScanButton({ status, progressLabel, progress, onScan }: Props) {
  const isRunning = status === 'fetching-markets' || status === 'analyzing';

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={onScan}
        disabled={isRunning}
        className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${
          isRunning
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm active:scale-95'
        }`}
      >
        {isRunning ? 'Scanning...' : status === 'complete' ? 'Rescan' : 'Scan Markets'}
      </button>
      {isRunning && (
        <div className="w-48">
          <div className="text-xs text-gray-500 mb-1">{progressLabel}</div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
