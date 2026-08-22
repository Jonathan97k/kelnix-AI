import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAI, zenJSON } from "./lib/ai";
import { requireApiUser } from "./lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });
  if (!(await requireApiUser(req, res))) return;

  try {
    const {
      topic,
      contentType,
      targetPlatform,
      targetAudience,
      tone,
      businessContext,
    } = req.body || {};

    if (!topic) {
      return res.status(400).json({ success: false, error: "Topic is required" });
    }

    const ai = await getAI();

    const bizContextPrompt = businessContext 
      ? `Business Context:
      - Name: ${businessContext.name}
      - Industry: ${businessContext.industry}
      - Description/Voice: ${businessContext.brandVoice}
      - Key Selling Points: ${businessContext.keySellingPoints}
      - Target Audience: ${businessContext.targetAudience}
      - Call to Action: ${businessContext.callToAction}
      
      Please incorporate this business identity naturally into the content.`
      : "No specific business context provided; generate a general high-quality result.";

    const prompt = `You are an expert AI Content Strategist and Scriptwriter for viral short-form video content (${targetPlatform}).
    
    Task: Generate a complete structured content plan for the following idea:
    "${topic}"

    Details:
    - Content Type: ${contentType}
    - Target Audience: ${targetAudience}
    - Tone: ${tone}
    ${bizContextPrompt}

    You must return a STRICT JSON object with the following keys:
    {
      "title": "Catchy title for the project",
      "hook": "A high-impact opening hook (first 3 seconds)",
      "shortDescription": "A brief summary of the video's goal",
      "fullScript": "The complete expanded script narrative",
      "scenes": [
        {
          "sceneNumber": 1,
          "duration": 3.0,
          "visualDescription": "Detailed description of what happens visually",
          "narration": "The exact spoken words for this scene",
          "onScreenText": "Punchy text overlay for this scene"
        }
      ],
      "caption": "Optimized social media caption for ${targetPlatform}",
      "hashtags": "#tag1 #tag2 #tag3 (8-12 viral hashtags)",
      "voiceoverScript": "The full continuous script for the voice-over artist",
      "suggestedDuration": 30
    }

    Guidelines:
    1. Scenes should be logically paced for a ${targetPlatform} video.
    2. Narration must be natural and conversational.
    3. Visual descriptions should be clear for a video editor.
    4. The hook must be designed to stop the scroll.
    5. Ensure the JSON is valid and contains no markdown formatting (no \`\`\`json blocks).`;

    let parsed: any = null;

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash", // Using latest flash for speed and JSON reliability
          contents: prompt,
          config: { responseMimeType: "application/json", temperature: 0.7 },
        });
        const text = (response as any).text || "{}";
        parsed = JSON.parse(text);
      } catch (geminiError: any) {
        console.warn("Gemini failed, trying OpenRouter fallback:", geminiError.message);
      }
    }

    if (!parsed) {
      try {
        const text = await zenJSON(prompt, 0.7);
        if (text) {
          parsed = JSON.parse(text);
          console.log("Used OpenRouter fallback for content generation.");
        }
      } catch (zenError: any) {
        console.warn("OpenRouter fallback failed:", zenError.message);
      }
    }

    if (!parsed) {
      return res.status(500).json({ 
        success: false, 
        error: "Both AI providers failed to generate a structured response. Please try again with a different topic." 
      });
    }

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error("Error in /api/generate-content:", error);
    res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
}
