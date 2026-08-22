import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireApiUser } from "./_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireApiUser(req, res);
  if (user === false) return;
  res.json({ status: "ok", user });
}
