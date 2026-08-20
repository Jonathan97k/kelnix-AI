import type { VercelRequest, VercelResponse } from "@vercel/node";

// NOTE: this is still the mock implementation carried over from server.ts —
// it does not actually upload to Facebook yet. Wire up the real Graph API
// call here before relying on it, or label it "coming soon" in the UI.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });

  try {
    const { pageId, pageName, accessToken } = req.body || {};

    if (!accessToken || !pageId) {
      return res.status(400).json({
        success: false,
        error: "Facebook access token and page ID are required",
      });
    }

    const mockPostId = 1234567890 + Math.floor(Math.random() * 1000000);
    const mockPostUrl = `https://facebook.com/${pageId}/posts/${mockPostId}`;

    await new Promise((resolve) => setTimeout(resolve, 1500));

    res.json({
      success: true,
      message: `Successfully published to ${pageName}'s Facebook Page!`,
      postUrl: mockPostUrl,
      postId: mockPostId.toString(),
    });
  } catch (error: any) {
    console.error("Error in /api/facebook/publish-reel:", error);
    res.status(500).json({ success: false, error: error.message || "Failed to publish to Facebook" });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: "50mb" } },
};
