import type { VercelRequest, VercelResponse } from "@vercel/node";
import { empty } from "./_lib/empty";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ status: "ok", msg: empty() });
}
