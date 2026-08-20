import { createHmac } from 'crypto';

export function setupCloudinaryRoutes(app: any) {
  // Cloudinary signature endpoint for secure direct client-side uploads
  app.post('/api/cloudinary/sign-upload', (req: any, res: any) => {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY || process.env.VITE_CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        return res.status(500).json({
          error: 'Cloudinary is not fully configured on the server. Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, or CLOUDINARY_API_SECRET.',
        });
      }

      const timestamp = Math.round(new Date().getTime() / 1000);
      const folder = req.body?.folder || 'kelnix_ai_media';

      // Construct parameters to sign (alphabetical order)
      const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
      const signature = createHmac('sha1', apiSecret)
        .update(paramsToSign)
        .digest('hex');

      return res.json({
        signature,
        timestamp,
        cloudName,
        apiKey,
        folder,
      });
    } catch (err: any) {
      console.error('[Cloudinary Sign] Error generating signature:', err);
      return res.status(500).json({ error: err.message || 'Internal server error generating upload signature' });
    }
  });
}
