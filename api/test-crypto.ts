import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac } from "crypto";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = createHmac("sha1", "test-secret")
    .update(`timestamp=${timestamp}`)
    .digest("hex");
  res.json({ status: "ok", signature, timestamp });
}
