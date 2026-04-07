import Anthropic from '@anthropic-ai/sdk';
import { PolymarketMarket, ClaudeAnalysis } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a calibrated prediction market analyst. Estimate the probability that a given event resolves YES, based on your training data, historical base rates, and domain knowledge.

Rules:
- Output probability between 0.05 and 0.95. Never output 0 or 1.
- If this requires very recent news you don't have, say so in dataLimitations and set confidence to "low".
- Do not refuse to estimate. Every question gets a number.
- Always consider historical base rates for this type of event first, then adjust for specifics.
- Be honest about uncertainty — it's better to say "low" confidence than to fabricate precision.

Output ONLY valid JSON with no markdown fences:
{
  "probability": <number 0.05-0.95>,
  "confidence": <"low" | "medium" | "high">,
  "reasoning": "<2-3 sentences explaining the estimate>",
  "dataLimitations": "<what information would change this estimate>"
}`;

function buildUserPrompt(market: PolymarketMarket): string {
  const daysLeft = market.endDate
    ? Math.max(0, Math.round((new Date(market.endDate).getTime() - Date.now()) / 86400000))
    : null;

  return `Market Question: ${market.question}

${market.description ? `Context: ${market.description}\n` : ''}Closes: ${market.endDate || 'unknown'}${daysLeft !== null ? ` (${daysLeft} days from now)` : ''}
Current market price (YES): ${(market.yesPrice * 100).toFixed(1)}%

Estimate the probability this resolves YES.
Consider:
- Historical base rate for this type of event
- Specific factors that push probability up or down
- Whether the crowd's price of ${(market.yesPrice * 100).toFixed(1)}% seems reasonable given base rates`;
}

function parseResponse(text: string): ClaudeAnalysis {
  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const parsed = JSON.parse(cleaned);

  const probability = Math.min(0.95, Math.max(0.05, Number(parsed.probability)));
  const confidence = ['low', 'medium', 'high'].includes(parsed.confidence)
    ? (parsed.confidence as ClaudeAnalysis['confidence'])
    : 'low';

  return {
    probability,
    confidence,
    reasoning: String(parsed.reasoning ?? ''),
    dataLimitations: String(parsed.dataLimitations ?? ''),
  };
}

export async function analyzeMarket(market: PolymarketMarket): Promise<ClaudeAnalysis> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(market) }],
  });

  const text = message.content
    .filter((b) => b.type === 'text')
    .map((b) => (b as { type: 'text'; text: string }).text)
    .join('');

  return parseResponse(text);
}
