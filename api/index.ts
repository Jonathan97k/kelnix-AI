import type { VercelRequest, VercelResponse } from "@vercel/node";
import { app } from "../server";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Let Express handle the request
  return app(req, res);
}