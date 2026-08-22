import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAI } from "./_lib/ai";
import { requireApiUser } from "./_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });
  if (!(await requireApiUser(req, res))) return;

  try {
    const { images } = req.body || {};
    const ai = await getAI();

    if (!ai || !images || !images.length) {
      return res.json({
        success: true,
        data: {
          detectedTheme: "Visual Memories",
          detectedVibe: "Aesthetic & Modern",
          suggestedCaptions: (images || []).map((_: any, i: number) => `Captured moment ${i + 1} \u2728`),
        },
      });
    }

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
  "suggestedCaptions": ["caption for image 1", "caption for image 2"],
  "musicMood": "e.g. Chill indie acoustic beat",
  "recommendedBpm": 115
}`,
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: { parts },
      config: { responseMimeType: "application/json", temperature: 0.7 },
    });

    const text = (response as any).text || "{}";
    const parsed = JSON.parse(text);

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn("Error in /api/analyze-photos, using built-in fallback:", error.message);
    res.json({
      success: true,
      data: {
        detectedTheme: "Visual Memories",
        detectedVibe: "Aesthetic & Modern",
        suggestedFilter: "cinematic",
        musicMood: "Chill ambient",
        recommendedBpm: 110,
        suggestedCaptions: (req.body?.images || []).map((_: any, i: number) => `Captured moment ${i + 1} \u2728`),
      },
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: "50mb" } },
};
