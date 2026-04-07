import { PolymarketMarket, ClaudeAnalysis, MarketSignal } from './types';
import { isCalibrationSignal } from './strategies/calibration';
import { calcTimeDecay } from './strategies/timeDecay';

export function buildSignal(
  market: PolymarketMarket,
  analysis: ClaudeAnalysis
): MarketSignal {
  const delta = analysis.probability - market.yesPrice;
  const absDelta = Math.abs(delta);
  const { flag: timeDecayFlag, perDay: timeDecayPerDay } = calcTimeDecay(
    market.yesPrice,
    analysis.probability,
    market.endDate
  );

  return {
    market,
    analysis,
    delta,
    absDelta,
    direction: delta > 0 ? 'underpriced' : 'overpriced',
    calibrationFlag: isCalibrationSignal(market.yesPrice),
    timeDecayFlag,
    timeDecayPerDay,
    scannedAt: new Date().toISOString(),
  };
}

export function sortSignals(signals: MarketSignal[]): MarketSignal[] {
  return [...signals].sort((a, b) => b.absDelta - a.absDelta);
}

export function formatPct(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatDelta(delta: number): string {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${(delta * 100).toFixed(1)}%`;
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function signalStrength(absDelta: number): 'strong' | 'moderate' | 'noise' {
  if (absDelta >= 0.2) return 'strong';
  if (absDelta >= 0.1) return 'moderate';
  return 'noise';
}
