/**
 * Strategy 5: Calibration Arbitrage
 *
 * Documented since the 1940s in horse racing (favourite-longshot bias).
 * Markets priced >85% resolve YES only ~78% of the time.
 * Markets priced <15% resolve YES ~11% of the time.
 * The crowd systematically overprices favourites and underprices longshots.
 */

export function isCalibrationSignal(yesPrice: number): boolean {
  return yesPrice > 0.85 || yesPrice < 0.15;
}

export function calibrationDirection(yesPrice: number): 'sell' | 'buy' | null {
  if (yesPrice > 0.85) return 'sell'; // overpriced favourite
  if (yesPrice < 0.15) return 'buy';  // underpriced longshot
  return null;
}
