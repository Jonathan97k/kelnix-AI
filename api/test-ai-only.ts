import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAI } from "./_lib/ai";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const ai = getAI();
  res.json({ status: "ok", hasAI: !!ai });
}
