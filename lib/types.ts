export interface PolymarketMarket {
  id: string;
  question: string;
  description: string;
  endDate: string;
  category: string;
  yesPrice: number; // 0.0 to 1.0
  volume24h: number;
  liquidity: number;
}

export interface ClaudeAnalysis {
  probability: number; // 0.05 to 0.95
  confidence: 'low' | 'medium' | 'high';
  reasoning: string;
  dataLimitations: string;
}

export interface MarketSignal {
  market: PolymarketMarket;
  analysis: ClaudeAnalysis;
  delta: number; // claude probability - market yes price (signed)
  absDelta: number;
  direction: 'overpriced' | 'underpriced';
  // Strategy 5: favourite-longshot bias
  calibrationFlag: boolean;
  // Strategy 6: time decay
  timeDecayFlag: boolean;
  timeDecayPerDay: number; // estimated daily price drift
  scannedAt: string;
}

export type ScanStatus =
  | 'idle'
  | 'fetching-markets'
  | 'analyzing'
  | 'complete'
  | 'error';

export interface ScanState {
  status: ScanStatus;
  markets: PolymarketMarket[];
  signals: MarketSignal[];
  progress: number; // 0-100
  progressLabel: string;
  error: string | null;
}
