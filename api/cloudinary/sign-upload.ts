import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';
import { getApiUser } from '../lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const user = await getApiUser(req);
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && !user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    return res.status(503).json({ success: false, error: 'Cloudinary is not configured on the server.' });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = user ? `kelnix/${user.id}` : 'kelnix_ai_media';
  const signature = createHmac('sha1', apiSecret)
    .update(`folder=${folder}&timestamp=${timestamp}`)
    .digest('hex');

  return res.json({ success: true, data: { signature, timestamp, cloudName, apiKey, folder } });
}
