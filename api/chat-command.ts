import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAI, zenJSON } from "../../lib/ai";
import { requireApiUser } from "../../lib/auth";

function cannedChatReply(message: string): string {
  return `I understood you said: "${message}". Use the buttons above (AI Director / Research / Clients) or ask for a script, research topic, or caption changes and I'll do my best to execute it.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });
  if (!(await requireApiUser(req, res))) return;

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
- "answer" -> params { "text": "direct answer if the user just asked a question or said hi" }
- "generate_script" -> params { "theme": "one of: Travel & Adventure, Aesthetic Vlog, High Energy / Fitness, Urban & Street, Romantic & Celebration, Cinematic Story", "tone": "one of: Cinematic & Inspiring, Chill & Aesthetic, High Energy & Bold, Playful & Viral, Emotional & Poetic, Minimalist & Elegant", "customPrompt": "optional extra direction from the user" }
- "research" -> params { "query": "the search topic the user wants to know about" }
- "update_config" -> params may include any of: "title", "socialCaption", "hashtags" (string), "aspectRatio" ("9:16"|"1:1"|"4:5"), "musicMood" (e.g. "upbeat EDM"), "recommendedBpm" (number)
- "caption_slides" -> params { "captions": ["caption for slide 1", "caption for slide 2"] } (exactly as many as slides)
- "bulk_effect" -> params { "effect": "transition"|"filter", "value": string } e.g. transition "fade" or filter "cinematic"

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
    const ai = await getAI();

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ parts: [{ text: prompt }] }],
          config: { responseMimeType: "application/json", temperature: 0.5 },
        });
        const text = (response as any).text || "";
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
      data: { reply: parsed.reply || "Got it!", actions: parsed.actions.slice(0, 3) },
    });
  } catch (error: any) {
    console.error("Error in /api/chat-command:", error);
    res.status(500).json({ success: false, error: error.message || "Command failed" });
  }
}
