import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ status: "ok", msg: "no lib imports", timestamp: new Date().toISOString() });
}
