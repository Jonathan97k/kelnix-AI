import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  // Facebook Publishing is not yet implemented
  // This endpoint is reserved for future integration with Facebook Graph API
  
  return res.status(501).json({
    success: false,
    error: 'Facebook publishing is not yet implemented. This feature is coming soon.',
  });
}

export const config = {
  api: { bodyParser: { sizeLimit: '50mb' } },
};

