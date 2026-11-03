import type { VercelRequest, VercelResponse } from '@vercel/node';

const FB_GRAPH = 'https://graph.facebook.com/v21.0';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const {
    pageId,
    pageName,
    accessToken,
    title,
    caption,
    videoUrl,
    thumbnailUrl,
  } = req.body;

  if (!accessToken || !pageId) {
    return res.status(400).json({
      success: false,
      error: 'Facebook page access token and page ID are required.',
    });
  }

  if (!videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'A video URL is required. Upload the video to Cloudinary first, then pass the URL.',
    });
  }

  try {
    // Step 1: Initiate a resumable upload session
    const initRes = await fetch(
      `${FB_GRAPH}/${pageId}/video_reels`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upload_phase: 'start',
          access_token: accessToken,
          file_url: videoUrl,
        }),
      }
    );

    const initData = await initRes.json() as Record<string, unknown>;

    if (!initRes.ok || !initData.video_id) {
      console.error('Facebook video_reels init failed:', initData);
      return res.status(initRes.status || 500).json({
        success: false,
        error: (initData as any).error?.message || 'Failed to initiate Facebook video upload.',
      });
    }

    const videoId = initData.video_id as string;
    const videoUrl2 = initData.video_url as string | undefined;

    // Step 2: Publish the reel
    const publishBody: Record<string, string> = {
      access_token: accessToken,
      video_id: videoId,
      upload_phase: 'finish',
    };
    if (title) publishBody.title = title;
    if (caption) publishBody.description = caption;
    if (thumbnailUrl) publishBody.image_url = thumbnailUrl;

    const pubRes = await fetch(
      `${FB_GRAPH}/${pageId}/video_reels`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(publishBody),
      }
    );

    const pubData = await pubRes.json() as Record<string, unknown>;

    if (!pubRes.ok) {
      console.error('Facebook video_reels publish failed:', pubData);
      return res.status(pubRes.status || 500).json({
        success: false,
        error: (pubData as any).error?.message || 'Failed to publish reel to Facebook.',
      });
    }

    const postId = pubData.id as string;
    const postUrl = `https://facebook.com/reels/${postId}`;

    return res.json({
      success: true,
      message: `Reel published to ${pageName || pageId}'s Facebook Page.`,
      postId,
      postUrl,
      videoId,
    });
  } catch (error: any) {
    console.error('Facebook publish error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to publish to Facebook.',
    });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } },
};

