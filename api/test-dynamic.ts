import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Dynamic import of auth.ts
  const auth = await import("./_lib/auth");
  const user = await auth.getApiUser(req);
  res.json({ status: "ok", user: user || "no-auth" });
}
