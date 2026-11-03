import { getAI, zenJSON } from "./ai";

export async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        Accept: "application/json, text/html, application/xml;q=0.9, */*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
}

export interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  date?: string;
}

export async function searchWikipedia(query: string, maxResults: number): Promise<ResearchSource[]> {
  const searchUrl =
    "https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&utf8=1&origin=*" +
    `&srsearch=${encodeURIComponent(query)}&srlimit=${maxResults}`;
  const data = await fetchWithTimeout(searchUrl).then((r) => r.json());
  const hits: any[] = data?.query?.search || [];
  const items: ResearchSource[] = hits.map((s: any) => ({
    title: s.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(s.title.replace(/\s+/g, "_"))}`,
    snippet: decodeEntities(stripHtml(s.snippet || "")),
  }));
  if (items.length) {
    try {
      const restUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        items[0].title.replace(/\s+/g, "_")
      )}`;
      const summary = await fetchWithTimeout(restUrl).then((r) => r.json());
      if (summary && summary.extract) {
        items[0] = { ...items[0], snippet: summary.extract };
      }
    } catch {
      // keep the search snippet
    }
  }
  return items;
}

export async function searchDuckDuckGo(query: string, maxResults: number): Promise<ResearchSource[]> {
  const results: ResearchSource[] = [];
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1&t=reelcraft`;
    const data = await fetchWithTimeout(url).then((r) => r.json());
    if (data.AbstractText) {
      results.push({ title: data.Heading || query, url: data.AbstractURL || "", snippet: data.AbstractText });
    }
    const related: any[] = Array.isArray(data.RelatedTopics) ? data.RelatedTopics : [];
    for (const topic of related) {
      if (Array.isArray(topic.Topics)) {
        for (const t of topic.Topics) {
          if (t?.Text && results.length < maxResults) {
            results.push({ title: t.Text.split(" - ")[0], url: t.FirstURL || "", snippet: t.Text });
          }
        }
      } else if (topic?.Text && results.length < maxResults) {
        results.push({ title: topic.Text.split(" - ")[0], url: topic.FirstURL || "", snippet: topic.Text });
      }
    }
  } catch {
    // ignore
  }

  if (results.length < maxResults) {
    try {
      const html = await fetchWithTimeout(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`).then((r) =>
        r.text()
      );
      const blocks = html.split('class="result results_links');
      for (let i = 1; i < blocks.length && results.length < maxResults; i++) {
        const block = blocks[i];
        const linkMatch = block.match(/class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/s);
        if (linkMatch) {
          let url = decodeEntities(linkMatch[1]);
          if (url.includes("uddg=")) {
            url = decodeURIComponent(url.match(/uddg=([^&]+)/)?.[1] || "");
          } else if (url.startsWith("//")) {
            url = `https:${url}`;
          }
          const snippetMatch = block.match(/class="result__snippet"[^>]*>(.*?)<\/(?:a|div)>/s);
          results.push({
            title: decodeEntities(stripHtml(linkMatch[2])),
            url,
            snippet: snippetMatch ? decodeEntities(stripHtml(snippetMatch[1])) : "",
          });
        }
      }
    } catch {
      // ignore
    }
  }

  return results.slice(0, maxResults);
}

export async function searchGoogleNews(query: string, maxResults: number): Promise<ResearchSource[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const xml = await fetchWithTimeout(url).then((r) => r.text());
  const items: ResearchSource[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/g;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(xml)) !== null && items.length < maxResults) {
    const block = match[1];
    const title = decodeEntities(stripHtml(block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || ""));
    const link = decodeEntities(block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "");
    const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || "";
    const desc = decodeEntities(stripHtml(block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || ""));
    if (title && link) {
      items.push({ title, url: link, snippet: desc, date: pubDate });
    }
  }
  return items;
}

export async function generateResearchSummary(query: string, sources: any): Promise<string | null> {
  // NOTE: timeouts kept short (under Vercel's default 10s function limit).
  // If you're on Vercel Pro (60s functions), you can raise these back up.
  const withTimeout = <T,>(p: Promise<T>, ms: number, label: string): Promise<T> =>
    Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms))]);

  const top = (items: any[]) =>
    (items || [])
      .slice(0, 4)
      .map((i) => `- ${i.title}: ${(i.snippet || "").slice(0, 300)}`)
      .join("\n");

  const prompt = `You are a concise research assistant. Answer this question using ONLY the facts found in the sources below: "${query}"

WEB RESULTS:
${top(sources.web) || "- (no web results)"}

NEWS RESULTS:
${top(sources.news) || "- (no news results)"}

WIKIPEDIA RESULTS:
${top(sources.wikipedia) || "- (no wikipedia results)"}

Respond with plain text (no markdown tables) in exactly this format:
ANSWER: A direct 2-4 sentence answer to the question.
KEY FACTS: 3-5 short bullet points (each starting with "- ").
BEST SOURCES: 1-3 URLs from the results above that are most relevant.`;

  const ai = await getAI();
  if (ai) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ parts: [{ text: prompt }] }],
          config: { temperature: 0.4 },
        }),
        7000,
        "Gemini summary"
      );
      const text = (response as any).text;
      if (text && text.trim()) return text.trim();
    } catch (e: any) {
      console.warn("Gemini research summary failed, trying OpenRouter:", e.message);
    }
  }

  try {
    const out = await withTimeout(zenJSON(prompt, 0.4), 7000, "OpenRouter summary");
    if (!out) return null;
    try {
      const parsed = JSON.parse(out);
      return typeof parsed.answer === "string" ? parsed.answer : out;
    } catch {
      return out;
    }
  } catch (e: any) {
    console.warn("OpenRouter research summary failed:", e.message);
    return null;
  }
}

