import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAI, zenJSON, cannedReelScript } from "./_lib/ai";
import { requireApiUser } from "./_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });
  if (!(await requireApiUser(req, res))) return;

  try {
    const {
      theme = "Travel & Lifestyle",
      tone = "Cinematic & Inspiring",
      photoCount = 5,
      photoDescriptions = [],
      customPrompt = "",
      targetAudience = "Instagram & TikTok",
    } = req.body || {};

    const ai = getAI();

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
  "recommendedBpm": 120,
  "recommendedPacing": 2.2,
  "recommendedTransition": "one of: crossfade, whip-left, whip-right, zoom-in, glitch, flash, slide-up",
  "captions": ["Short punchy on-screen caption for slide 1 (max 7 words with 1 emoji)", "Caption for slide 2...", "...exactly ${photoCount} items"],
  "narrations": ["Voiceover script line for slide 1 (1-2 smooth sentences)", "Voiceover line for slide 2...", "...exactly ${photoCount} items"],
  "socialCaption": "Engaging full Instagram/TikTok caption copy with call-to-action",
  "hashtags": "8-12 relevant viral hashtags formatted as #tag1 #tag2..."
}`;

    let parsed: any = null;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.8 },
        });
        const text = (response as any).text || "{}";
        parsed = JSON.parse(text);
      } catch (geminiError: any) {
        console.warn("Gemini failed, trying OpenRouter fallback:", geminiError.message);
      }
    }

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

    if (!parsed) {
      parsed = cannedReelScript(theme, photoCount);
    }

    if (!Array.isArray(parsed.captions) || parsed.captions.length < photoCount) {
      parsed.captions = Array.from({ length: photoCount }, (_, i) => `Moment ${i + 1} \u2728`);
    }
    if (!Array.isArray(parsed.narrations) || parsed.narrations.length < photoCount) {
      parsed.narrations = Array.from({ length: photoCount }, () => "Capturing the true feeling of the moment.");
    }

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/generate-script:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to generate reel script" });
  }
}
