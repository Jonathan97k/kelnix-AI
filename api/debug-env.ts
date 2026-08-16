// TODO: Remove this debug endpoint once environment variable issue is resolved.
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const geminiKey = process.env.GEMINI_API_KEY ?? '';
  const openCodeKey = process.env.OPENCODE_API_KEY ?? '';
  const openCodeBaseUrl = process.env.OPENCODE_BASE_URL ?? '';
  const openCodeModel = process.env.OPENCODE_MODEL ?? '';
  const appUrl = process.env.APP_URL ?? '';

  // Gemini keys can start with either 'AIza' (legacy) or 'AQ.' (newer format)
  // Typical lengths: legacy ~39 chars, newer format varies but usually 50-100+ chars
  const geminiKeyLooksValid = 
    (geminiKey.startsWith('AIza') && geminiKey.length >= 35 && geminiKey.length <= 45) ||
    (geminiKey.startsWith('AQ.') && geminiKey.length >= 30); // AQ. keys tend to be longer

  res.json({
    GEMINI_API_KEY: !!geminiKey,
    OPENCODE_API_KEY: !!openCodeKey,
    OPENCODE_BASE_URL: !!openCodeBaseUrl,
    OPENCODE_MODEL: !!openCodeModel,
    APP_URL: !!appUrl,
    geminiKeyLooksValid,
  });
}

