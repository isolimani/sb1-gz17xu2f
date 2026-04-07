/**
 * Strategy 6: Time Decay Extraction
 *
 * Markets with a long deadline, inflated YES price, and low base rate
 * drift down slowly every day without the event occurring.
 * Signal: SELL YES — time works against the overpriced contract.
 */

export interface TimeDecayResult {
  flag: boolean;
  perDay: number; // estimated daily % drift toward fair value
}

export function calcTimeDecay(
  yesPrice: number,
  claudeProbability: number,
  endDate: string
): TimeDecayResult {
  const daysLeft = endDate
    ? Math.max(1, Math.round((new Date(endDate).getTime() - Date.now()) / 86400000))
    : 0;

  if (daysLeft === 0) return { flag: false, perDay: 0 };

  const overpricing = yesPrice - claudeProbability;
  const perDay = overpricing / daysLeft;

  // Flag if: long enough runway, meaningfully overpriced, Claude agrees
  const flag =
    daysLeft > 30 &&
    yesPrice > 0.20 &&
    overpricing > 0.10;

  return { flag, perDay: Math.max(0, perDay) };
}
