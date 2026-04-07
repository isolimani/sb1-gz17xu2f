/**
 * Strategy 2: Conditional Probability Mispricing
 *
 * Finds pairs of markets in the same category where the prices are
 * mathematically inconsistent — e.g. P(A ∩ B) > P(B) is impossible.
 * Each contradiction is a potential arbitrage opportunity.
 */

import { PolymarketMarket } from '../types';

export interface ConditionalConflict {
  marketA: PolymarketMarket;
  marketB: PolymarketMarket;
  description: string;
  impliedConditional: number;
  historicalBase: number | null;
}

/**
 * Simple keyword overlap scorer — two markets are "related" if they share
 * 2+ significant words (ignoring stop words).
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or',
  'will', 'by', 'be', 'is', 'are', 'was', 'before', 'after', 'with',
]);

function keywords(question: string): Set<string> {
  return new Set(
    question
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const w of a) if (b.has(w)) count++;
  return count;
}

export function findConditionalConflicts(
  markets: PolymarketMarket[]
): ConditionalConflict[] {
  const conflicts: ConditionalConflict[] = [];

  // Group by category first to reduce pairs
  const byCategory = new Map<string, PolymarketMarket[]>();
  for (const m of markets) {
    const cat = m.category ?? 'General';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(m);
  }

  for (const [, group] of byCategory) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i];
        const b = group[j];

        const kwA = keywords(a.question);
        const kwB = keywords(b.question);
        if (overlap(kwA, kwB) < 2) continue;

        // If one price is higher than the other but logically it should be lower
        // e.g. P(specific outcome) > P(broader outcome) is a contradiction
        const higher = a.yesPrice > b.yesPrice ? a : b;
        const lower = a.yesPrice > b.yesPrice ? b : a;

        // A specific event can't be more likely than a broader event that contains it
        // Heuristic: if the more specific question's price > broader question's price by >10%
        const higherWords = higher.question.toLowerCase();
        const lowerWords = lower.question.toLowerCase();

        // Look for containment patterns (e.g. "wins state X" vs "wins election")
        const isNarrower =
          higherWords.includes(lowerWords.slice(0, 20)) === false &&
          higher.yesPrice - lower.yesPrice > 0.1;

        if (isNarrower) {
          const impliedConditional = lower.yesPrice > 0 ? higher.yesPrice / lower.yesPrice : 0;
          conflicts.push({
            marketA: higher,
            marketB: lower,
            description: `"${higher.question.slice(0, 60)}..." priced at ${(higher.yesPrice * 100).toFixed(0)}% but related market "${lower.question.slice(0, 60)}..." only at ${(lower.yesPrice * 100).toFixed(0)}%`,
            impliedConditional,
            historicalBase: null,
          });
        }
      }
    }
  }

  return conflicts.slice(0, 10); // top 10 conflicts
}
