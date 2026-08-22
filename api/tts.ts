import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAI } from "./_lib/ai";
import { requireApiUser } from "./_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });
  if (!(await requireApiUser(req, res))) return;

  try {
    const { text, voiceName = "Kore" } = req.body || {};
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const ai = await getAI();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: "Gemini API key not configured for TTS. Client can use browser Web Speech API fallback.",
      });
    }

    const validVoices = ["Kore", "Puck", "Charon", "Fenrir", "Zephyr"];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : "Kore";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say naturally and cinematically: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: chosenVoice } },
        },
      },
    } as any);

    const base64Audio = (response as any).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType =
      (response as any).candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || "audio/pcm;rate=24000";

    if (!base64Audio) {
      throw new Error("No audio returned from Gemini TTS");
    }

    res.json({ success: true, data: { base64Audio, mimeType } });
  } catch (error: any) {
    console.error("Error in /api/tts:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to synthesize voice" });
  }
}
