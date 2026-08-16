import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using intelligent algorithmic fallbacks for reel generation.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// OpenRouter free-model fallback (OpenAI-compatible) — used when Gemini is
// unavailable or fails. Wired to the machine's OpenRouter key + a free model
// (see .env: OPENCODE_API_KEY / OPENCODE_MODEL / OPENCODE_BASE_URL).
async function zenJSON(prompt: string, temperature: number): Promise<string | null> {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) {
    console.warn("OPENCODE_API_KEY is not set. Skipping OpenCode Zen fallback.");
    return null;
  }
  const model = process.env.OPENCODE_MODEL || "deepseek-v4-flash-free";
  const baseUrl = (process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1").replace(/\/+$/, "");
  const messages = [{ role: "user", content: prompt }];

  const call = async (extra: any) => {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, temperature, messages, ...extra }),
    });
    if (!res.ok) {
      throw new Error(`OpenRouter API error ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    return (await res.json()).choices?.[0]?.message?.content || null;
  };

  // JSON mode first; retry without it in case the gateway rejects the param.
  try {
    const out = await call({ response_format: { type: "json_object" } });
    if (out) return out;
  } catch (e: any) {
    if (!/error (400|422)/i.test(e.message)) throw e;
  }
  return call({});
}

// Built-in creative generator used when both AI providers are unavailable
function cannedReelScript(theme: string, photoCount: number) {
  const fallbackThemes: Record<string, any> = {
        "Travel & Lifestyle": {
          title: "Wanderlust Chronicles",
          hook: "Moments you never want to forget ✨",
          musicMood: "Uplifting Lo-Fi & Ambient Beats",
          recommendedBpm: 120,
          captions: [
            "Chasing new horizons 🌅",
            "Lost in the right direction",
            "These views hit different",
            "Collecting memories, not things",
            "Until the next adventure ✈️",
            "Golden hours and good vibes",
            "Hidden gems along the way",
            "Pure serenity"
          ],
          narrations: [
            "Sometimes you just have to step outside and let the world surprise you.",
            "Finding magic in every little turn and quiet moment.",
            "Every frame tells a story of where we've been and where we're going.",
            "Take the leap, soak it all in, and don't look back.",
            "Memories made here will last forever."
          ],
          hashtags: "#travelreels #wanderlust #cinematic #goldenhour #lifestyle #travelphotography #explore #aesthetic",
          captionText: "Every journey has a story worth telling. Here's a glimpse into the moments that made time stand still. 🌍✨ Which place should I explore next?"
        },
        "Aesthetic Vlog": {
          title: "Aesthetic Day in Life",
          hook: "Romanticizing the simple moments ☕🤍",
          musicMood: "Soft Warm Acoustic & Lo-Fi",
          recommendedBpm: 96,
          captions: [
            "Morning light & slow sips ☕",
            "Finding beauty in ordinary things",
            "A gentle pause in a fast world",
            "Little details you might miss",
            "Grateful for today's peace 🕊️",
            "Warm coffee, warm thoughts"
          ],
          narrations: [
            "Here is your reminder to slow down and romanticize the small things.",
            "Morning sunbeams, quiet spaces, and warm energy.",
            "Creating peace in the middle of everyday life.",
            "Today was simply good for the soul."
          ],
          hashtags: "#aesthetic #vlog #softlife #slowliving #dailyroutine #aestheticreels #mindfulness",
          captionText: "A soft chapter. Finding peace in the quiet routines and gentle sunlight. 🕊️☕ Tell me: what was the highlight of your day?"
        },
        "High Energy / Fitness": {
          title: "Unstoppable Grind",
          hook: "Proof that consistency beats talent every single time 🔥",
          musicMood: "Hard Trap & Bass Wave",
          recommendedBpm: 138,
          captions: [
            "Show up before the world wakes up ⚡",
            "No excuses, just execution",
            "Building the best version daily",
            "The hard work happens in silence",
            "Level up season is here 🏆"
          ],
          narrations: [
            "Nobody sees the early mornings or the reps in the dark, but the results will speak for themselves.",
            "Push past the comfort zone. That's where growth begins.",
            "Stay hungry, stay locked in, and never negotiate with weakness."
          ],
          hashtags: "#fitnessmotivation #gymreels #discipline #grindset #fitnessjourney #levelup #workout",
          captionText: "Consistency is the only cheat code. Keep putting in the work even when nobody is watching. ⚡🔥"
        }
      };

      const selected = fallbackThemes[theme] || fallbackThemes["Travel & Lifestyle"];
      const generatedCaptions = selected.captions.slice(0, photoCount);
      while (generatedCaptions.length < photoCount) {
        generatedCaptions.push(`Frame ${generatedCaptions.length + 1} • Pure vibe ✨`);
      }

      const generatedNarrations = selected.narrations.slice(0, photoCount);
      while (generatedNarrations.length < photoCount) {
        generatedNarrations.push("Another unforgettable perspective caught on camera.");
      }

      return {
        title: selected.title,
        hook: selected.hook,
        musicMood: selected.musicMood,
        recommendedBpm: selected.recommendedBpm,
        captions: generatedCaptions,
        narrations: generatedNarrations,
        socialCaption: selected.captionText,
        hashtags: selected.hashtags,
        recommendedTransition: "whip-left",
        recommendedPacing: 2.2,
      };
}

// AI Script & Story Generator
app.post("/api/generate-script", async (req, res) => {
  try {
    const {
      theme = "Travel & Lifestyle",
      tone = "Cinematic & Inspiring",
      photoCount = 5,
      photoDescriptions = [],
      customPrompt = "",
      targetAudience = "Instagram & TikTok",
    } = req.body;

    const ai = getAI();

    // Call Gemini 3.7 Flash for rich, tailored reel script & metadata
    const prompt = `You are a viral social media video director & editor for Instagram Reels, TikTok, and YouTube Shorts.
Generate a cohesive, viral, cinematic reel concept tailored for ${photoCount} sequential photos.

Context:
- Theme / Vibe: ${theme}
- Tone: ${tone}
- Number of photo slides: ${photoCount}
- Photo details/hints: ${photoDescriptions.length ? photoDescriptions.join(" | ") : "User uploaded photos for this theme"}
- Custom instructions: ${customPrompt || "Make it captivating, modern, and viral"}
- Target: ${targetAudience}

Return strict JSON with the following structure:
{
  "title": "Short catchy reel title (3-5 words)",
  "hook": "Compelling visual hook for the first 3 seconds",
  "musicMood": "Description of perfect background track (e.g. 'Chill Lo-Fi guitar beat', 'Fast-paced Cyberpunk synth', 'Warm cinematic piano buildup')",
  "recommendedBpm": 120 (a number between 85 and 150),
  "recommendedPacing": 2.2 (seconds per slide, number between 1.4 and 3.5),
  "recommendedTransition": "one of: crossfade, whip-left, whip-right, zoom-in, glitch, flash, slide-up",
  "captions": ["Short punchy on-screen caption for slide 1 (max 7 words with 1 emoji)", "Caption for slide 2...", ... exactly ${photoCount} items],
  "narrations": ["Voiceover script line for slide 1 (1-2 smooth sentences)", "Voiceover line for slide 2...", ... exactly ${photoCount} items],
  "socialCaption": "Engaging full Instagram/TikTok caption copy with call-to-action",
  "hashtags": "8-12 relevant viral hashtags formatted as #tag1 #tag2..."
}`;

    let parsed: any = null;

    // 1) Primary: Gemini
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.8,
          },
        });

        const text = response.text || "{}";
        parsed = JSON.parse(text);
      } catch (geminiError: any) {
        console.warn("Gemini failed, trying DeepSeek fallback:", geminiError.message);
      }
    }

    // 2) Fallback: OpenRouter free model (OpenAI-compatible)
    if (!parsed) {
      try {
        const text = await zenJSON(prompt, 0.8);
        if (text) {
          parsed = JSON.parse(text);
          console.log("Used OpenRouter fallback for script generation.");
        }
      } catch (zenError: any) {
        console.warn("OpenRouter fallback failed, using built-in generator:", zenError.message);
      }
    }

    // 3) Last resort: built-in canned generator
    if (!parsed) {
      parsed = cannedReelScript(theme, photoCount);
    }

    // Validate lengths
    if (!Array.isArray(parsed.captions) || parsed.captions.length < photoCount) {
      parsed.captions = Array.from({ length: photoCount }, (_, i) => `Moment ${i + 1} ✨`);
    }
    if (!Array.isArray(parsed.narrations) || parsed.narrations.length < photoCount) {
      parsed.narrations = Array.from({ length: photoCount }, () => "Capturing the true feeling of the moment.");
    }

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("Error in /api/generate-script:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate reel script",
    });
  }
});

// Image Analysis with Vision
app.post("/api/analyze-photos", async (req, res) => {
  try {
    const { images } = req.body; // array of { base64: string, mimeType?: string }
    const ai = getAI();

    if (!ai || !images || !images.length) {
      return res.json({
        success: true,
        data: {
          detectedTheme: "Visual Memories",
          detectedVibe: "Aesthetic & Modern",
          suggestedCaptions: (images || []).map((_: any, i: number) => `Captured moment ${i + 1} ✨`),
        },
      });
    }

    // Prepare parts with up to 5 images for analysis
    const limitedImages = images.slice(0, 5);
    const parts: any[] = limitedImages.map((img: { base64: string; mimeType?: string }) => ({
      inlineData: {
        mimeType: img.mimeType || "image/jpeg",
        data: img.base64.replace(/^data:image\/[a-z]+;base64,/, ""),
      },
    }));

    parts.push({
      text: `Analyze these sequential photos and determine:
1. The overall story or theme that connects them.
2. A unique, engaging, short on-screen caption (3-7 words) for each photo in sequence.
3. The best aesthetic filter style (e.g., 'cinematic', 'golden-hour', 'vintage-film', 'nordic-cool', 'cyberpunk').
4. Suggested music vibe and BPM.

Return JSON:
{
  "detectedTheme": "e.g. Sunset Coastal Roadtrip",
  "detectedVibe": "e.g. Golden hour warm nostalgia",
  "suggestedFilter": "golden-hour",
  "suggestedCaptions": ["caption for image 1", "caption for image 2", ...],
  "musicMood": "e.g. Chill indie acoustic beat",
  "recommendedBpm": 115
}`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);

    res.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    // Note: DeepSeek fallback is text-only (no vision), so on Gemini failure we
    // degrade to the built-in generator instead of erroring out.
    console.warn("Error in /api/analyze-photos, using built-in fallback:", error.message);
    res.json({
      success: true,
      data: {
        detectedTheme: "Visual Memories",
        detectedVibe: "Aesthetic & Modern",
        suggestedFilter: "cinematic",
        musicMood: "Chill ambient",
        recommendedBpm: 110,
        suggestedCaptions: (req.body?.images || []).map((_: any, i: number) => `Captured moment ${i + 1} ✨`),
      },
    });
  }
});

// Gemini Text-To-Speech (TTS) endpoint
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voiceName = "Kore" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = getAI();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "Gemini API key not configured for TTS. Client can use browser Web Speech API fallback.",
      });
    }

    // Supported voices: Kore, Puck, Charon, Fenrir, Zephyr
    const validVoices = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : "Kore";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say naturally and cinematically: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "audio/pcm;rate=24000";

    if (!base64Audio) {
      throw new Error("No audio returned from Gemini TTS");
    }

    res.json({
      success: true,
      data: {
        base64Audio,
        mimeType,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/tts:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to synthesize voice",
    });
  }
});

// ─── Internet Research (free, no API keys) ─────────────────────────────────
// Sources: Wikipedia, DuckDuckGo, Google News RSS. The AI chain
// (Gemini → OpenRouter free model) then synthesizes a plain-text answer.

async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
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
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

interface ResearchSource {
  title: string;
  url: string;
  snippet: string;
  date?: string;
}

async function searchWikipedia(query: string, maxResults: number): Promise<ResearchSource[]> {
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
      const restUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(items[0].title.replace(/\s+/g, "_"))}`;
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

async function searchDuckDuckGo(query: string, maxResults: number): Promise<ResearchSource[]> {
  const results: ResearchSource[] = [];

  // 1) Instant Answer API (structured, often sparse)
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

  // 2) HTML search page scrape (rich, no JS required)
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

async function searchGoogleNews(query: string, maxResults: number): Promise<ResearchSource[]> {
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

async function generateResearchSummary(query: string, sources: any): Promise<string | null> {
  const withTimeout = <T>(p: Promise<T>, ms: number, label: string): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms)),
    ]);
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

  const ai = getAI();
  if (ai) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ parts: [{ text: prompt }] }],
          config: { temperature: 0.4 },
        }),
        30000,
        "Gemini summary"
      );
      const text = response.text;
      if (text && text.trim()) return text.trim();
    } catch (e: any) {
      console.warn("Gemini research summary failed, trying OpenRouter:", e.message);
    }
  }
  try {
    const out = await withTimeout(zenJSON(prompt, 0.4), 25000, "OpenRouter summary");
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

// Free, key-less internet research: Wikipedia + DuckDuckGo + Google News RSS,
// optionally summarized by the AI chain (Gemini → OpenRouter free model).
app.post("/api/research", async (req, res) => {
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
    console.log(`[research] sources done: web=${web.status} news=${news.status} wiki=${wikipedia.status}`);

    const sources = {
      wikipedia: wikipedia.status === "fulfilled" ? wikipedia.value : [],
      web: web.status === "fulfilled" ? web.value : [],
      news: news.status === "fulfilled" ? news.value : [],
    };

    const answer = await generateResearchSummary(q, sources);
    console.log(`[research] summary done: ${answer ? answer.length + " chars" : "null"}`);

    res.json({
      success: true,
      data: { query: q, answer, sources },
    });
  } catch (error: any) {
    console.error("Error in /api/research:", error);
    res.status(500).json({ success: false, error: error.message || "Research failed" });
  }
});

// ─── Natural-Language Command Chat ─────────────────────────────────────────
// Turns a plain-English instruction into an executable action plan the app
// can run (generate scripts, research, edit captions, change config, ...).

function cannedChatReply(message: string): string {
  return `I understood you said: "${message}". Use the buttons above (AI Director / Research / Clients) or ask for a script, research topic, or caption changes and I'll do my best to execute it.`;
}

app.post("/api/chat-command", async (req, res) => {
  try {
    const { message, context = {} } = req.body || {};
    if (!message || !String(message).trim()) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }
    const msg = String(message).trim();
    const ctx = {
      slideCount: context.slideCount ?? 0,
      theme: context.theme ?? "Travel & Adventure",
      tone: context.tone ?? "Cinematic & Inspiring",
      aspectRatio: context.aspectRatio ?? "9:16",
      title: context.title ?? "",
    };

    const prompt = `You are the command brain of ReelCraft, a Reels video editor. The user gives you an instruction in plain English. Decide what the app should DO and reply with ONLY a JSON object (no markdown, no code fences):

{
  "reply": "a short, friendly confirmation of what you are about to do (1-2 sentences)",
  "actions": [
    { "type": "...", "params": { ... } }
  ]
}

Allowed action types and params:
- "answer"            -> params { "text": "direct answer if the user just asked a question or said hi" }
- "generate_script"   -> params { "theme": "one of: Travel & Adventure, Aesthetic Vlog, High Energy / Fitness, Urban & Street, Romantic & Celebration, Cinematic Story", "tone": "one of: Cinematic & Inspiring, Chill & Aesthetic, High Energy & Bold, Playful & Viral, Emotional & Poetic, Minimalist & Elegant", "customPrompt": "optional extra direction from the user" }
- "research"          -> params { "query": "the search topic the user wants to know about" }
- "update_config"     -> params may include any of: "title", "socialCaption", "hashtags" (string), "aspectRatio" ("9:16"|"1:1"|"4:5"), "musicMood" (e.g. "upbeat EDM"), "recommendedBpm" (number)
- "caption_slides"    -> params { "captions": ["caption for slide 1", "caption for slide 2", ...] } (exactly as many as slides)
- "bulk_effect"       -> params { "effect": "transition"|"filter", "value": string } e.g. transition "fade" or filter "cinematic"

Rules:
- Prefer concrete actions over vague replies. If the user asks to make a reel/script about a topic, emit generate_script (with customPrompt containing the topic).
- If the user asks to find information or research something, emit research.
- Combine actions when the request has multiple parts (e.g. research THEN generate a script about it).
- Match themes/tones to the closest allowed value if the user describes a vibe.
- Emit at most 3 actions.

Current app state:
- ${ctx.slideCount} slides in the reel
- current theme: ${ctx.theme}
- current tone: ${ctx.tone}
- current aspect ratio: ${ctx.aspectRatio}
- current title: ${ctx.title || "(none)"}

User instruction: "${msg}"`;

    let parsed: any = null;
    const ai = getAI();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [{ parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json", temperature: 0.5 },
        });
        const text = response.text || "";
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start >= 0 && end > start) parsed = JSON.parse(text.slice(start, end + 1));
      } catch (e: any) {
        console.warn("Gemini chat-command failed, trying OpenRouter:", e.message);
      }
    }
    if (!parsed) {
      try {
        const out = await zenJSON(prompt, 0.5);
        if (out) {
          const start = out.indexOf("{");
          const end = out.lastIndexOf("}");
          if (start >= 0 && end > start) parsed = JSON.parse(out.slice(start, end + 1));
        }
      } catch (e: any) {
        console.warn("OpenRouter chat-command failed:", e.message);
      }
    }

    if (!parsed || !Array.isArray(parsed.actions)) {
      return res.json({ success: true, data: { reply: cannedChatReply(msg), actions: [] } });
    }

    res.json({
      success: true,
      data: {
        reply: parsed.reply || "Got it!",
        actions: parsed.actions.slice(0, 3),
      },
    });
  } catch (error: any) {
    console.error("Error in /api/chat-command:", error);
    res.status(500).json({ success: false, error: error.message || "Command failed" });
  }
});

// Facebook Reel Publishing Endpoint (Mock Implementation)
app.post('/api/facebook/publish-reel', async (req, res) => {
  try {
    const {
      clientName,
      pageId,
      pageName,
      accessToken,
      title,
      caption,
      videoBase64,
      publishType = 'reel'
    } = req.body;

    // Validate required fields
    if (!accessToken || !pageId) {
      return res.status(400).json({
        success: false,
        error: 'Facebook access token and page ID are required'
      });
    }

    // In a real implementation, we would:
    // 1. Decode the videoBase64 to get the actual video file
    // 2. Upload it to Facebook Graph API using the access token
    // 3. Create a post/reel with the caption
    // 4. Return the actual post URL from Facebook
    
    // For now, we'll simulate a successful publish
    const mockPostId = 1234567890 + Math.floor(Math.random() * 1000000);
    const mockPostUrl = `https://facebook.com/${pageId}/posts/${mockPostId}`;
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    res.json({
      success: true,
      message: `Successfully published to ${pageName}'s Facebook Page!`,
      postUrl: mockPostUrl,
      postId: mockPostId.toString()
    });
  } catch (error) {
    console.error('Error in /api/facebook/publish-reel:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to publish to Facebook'
    });
  }
});


// Start Server with Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ReelCraft server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

