import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Using intelligent algorithmic fallbacks.");
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });
  }
  return aiClient;
}

// OpenRouter free-model fallback (OpenAI-compatible) — used when Gemini is
// unavailable or fails. Wired via OPENCODE_API_KEY / OPENCODE_MODEL / OPENCODE_BASE_URL.
export async function zenJSON(prompt: string, temperature: number): Promise<string | null> {
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

  try {
    const out = await call({ response_format: { type: "json_object" } });
    if (out) return out;
  } catch (e: any) {
    if (!/error (400|422)/i.test(e.message)) throw e;
  }
  return call({});
}

// Built-in creative generator used when both AI providers are unavailable
export function cannedReelScript(theme: string, photoCount: number) {
  const fallbackThemes: Record<string, any> = {
    "Travel & Lifestyle": {
      title: "Wanderlust Chronicles",
      hook: "Moments you never want to forget \u2728",
      musicMood: "Uplifting Lo-Fi & Ambient Beats",
      recommendedBpm: 120,
      captions: [
        "Chasing new horizons \ud83c\udf05",
        "Lost in the right direction",
        "These views hit different",
        "Collecting memories, not things",
        "Until the next adventure \u2708\ufe0f",
        "Golden hours and good vibes",
        "Hidden gems along the way",
        "Pure serenity",
      ],
      narrations: [
        "Sometimes you just have to step outside and let the world surprise you.",
        "Finding magic in every little turn and quiet moment.",
        "Every frame tells a story of where we've been and where we're going.",
        "Take the leap, soak it all in, and don't look back.",
        "Memories made here will last forever.",
      ],
      hashtags: "#travelreels #wanderlust #cinematic #goldenhour #lifestyle #travelphotography #explore #aesthetic",
      captionText:
        "Every journey has a story worth telling. Here's a glimpse into the moments that made time stand still. \ud83c\udf0d\u2728 Which place should I explore next?",
    },
    "Aesthetic Vlog": {
      title: "Aesthetic Day in Life",
      hook: "Romanticizing the simple moments \u2615\ud83e\udd0d",
      musicMood: "Soft Warm Acoustic & Lo-Fi",
      recommendedBpm: 96,
      captions: [
        "Morning light & slow sips \u2615",
        "Finding beauty in ordinary things",
        "A gentle pause in a fast world",
        "Little details you might miss",
        "Grateful for today's peace \ud83d\udd4a\ufe0f",
        "Warm coffee, warm thoughts",
      ],
      narrations: [
        "Here is your reminder to slow down and romanticize the small things.",
        "Morning sunbeams, quiet spaces, and warm energy.",
        "Creating peace in the middle of everyday life.",
        "Today was simply good for the soul.",
      ],
      hashtags: "#aesthetic #vlog #softlife #slowliving #dailyroutine #aestheticreels #mindfulness",
      captionText:
        "A soft chapter. Finding peace in the quiet routines and gentle sunlight. \ud83d\udd4a\ufe0f\u2615 Tell me: what was the highlight of your day?",
    },
    "High Energy / Fitness": {
      title: "Unstoppable Grind",
      hook: "Proof that consistency beats talent every single time \ud83d\udd25",
      musicMood: "Hard Trap & Bass Wave",
      recommendedBpm: 138,
      captions: [
        "Show up before the world wakes up \u26a1",
        "No excuses, just execution",
        "Building the best version daily",
        "The hard work happens in silence",
        "Level up season is here \ud83c\udfc6",
      ],
      narrations: [
        "Nobody sees the early mornings or the reps in the dark, but the results will speak for themselves.",
        "Push past the comfort zone. That's where growth begins.",
        "Stay hungry, stay locked in, and never negotiate with weakness.",
      ],
      hashtags: "#fitnessmotivation #gymreels #discipline #grindset #fitnessjourney #levelup #workout",
      captionText:
        "Consistency is the only cheat code. Keep putting in the work even when nobody is watching. \u26a1\ud83d\udd25",
    },
  };

  const selected = fallbackThemes[theme] || fallbackThemes["Travel & Lifestyle"];

  const generatedCaptions = selected.captions.slice(0, photoCount);
  while (generatedCaptions.length < photoCount) {
    generatedCaptions.push(`Frame ${generatedCaptions.length + 1} \u2022 Pure vibe \u2728`);
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
