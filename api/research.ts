import type { VercelRequest, VercelResponse } from "@vercel/node";
import { searchWikipedia, searchDuckDuckGo, searchGoogleNews, generateResearchSummary } from "./_lib/research";
import { requireApiUser } from "./_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });
  if (!(await requireApiUser(req, res))) return;

  try {
    const { query, maxResults = 5 } = req.body || {};
    if (!query || !String(query).trim()) {
      return res.status(400).json({ success: false, error: "Query is required" });
    }

    const q = String(query).trim();
    const limit = Math.min(Math.max(parseInt(maxResults, 10) || 5, 1), 10);

    const [wikipedia, web, news] = await Promise.allSettled([
      searchWikipedia(q, limit),
      searchDuckDuckGo(q, limit),
      searchGoogleNews(q, Math.min(limit, 6)),
    ]);

    const sources = {
      wikipedia: wikipedia.status === "fulfilled" ? wikipedia.value : [],
      web: web.status === "fulfilled" ? web.value : [],
      news: news.status === "fulfilled" ? news.value : [],
    };

    const answer = await generateResearchSummary(q, sources);

    res.json({ success: true, data: { query: q, answer, sources } });
  } catch (error: any) {
    console.error("Error in /api/research:", error);
    res.status(500).json({ success: false, error: error.message || "Research failed" });
  }
}

// Give this function a bit more headroom since it hits 3 external APIs + an AI
// summary call. Only takes effect on Vercel Pro/Enterprise (Hobby caps at 10s).
export const config = {
  maxDuration: 30,
};
