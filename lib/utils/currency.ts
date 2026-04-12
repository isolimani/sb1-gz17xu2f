import type { ShiftCost } from "@/lib/types";

const PLATFORM_FEE_PCT = 7;

export function computeShiftCost(
  hourlyRate: number,
  totalHours: number
): ShiftCost {
  const gross = parseFloat((hourlyRate * totalHours).toFixed(2));
  const platformFee = parseFloat((gross * (PLATFORM_FEE_PCT / 100)).toFixed(2));
  const businessTotal = parseFloat((gross + platformFee).toFixed(2));

  return {
    gross,
    platformFee,
    businessTotal,
    totalHours,
    hourlyRate,
  };
}

export function formatAUD(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAUDCompact(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return formatAUD(amount);
}

/** Show barista rate as-is, and note the business pays slightly more */
export function businessRateLabel(hourlyRate: number): string {
  const withFee = hourlyRate * (1 + PLATFORM_FEE_PCT / 100);
  return `$${hourlyRate}/hr to worker • $${withFee.toFixed(2)}/hr to you incl. 7% fee`;
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}
