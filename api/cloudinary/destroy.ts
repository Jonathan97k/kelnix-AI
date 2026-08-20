import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getApiUser } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const user = await getApiUser(req);
  if (!user) return res.status(401).json({ success: false, error: 'Authentication required.' });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const mediaAssetId = req.body?.mediaAssetId;
  if (!cloudName || !apiKey || !apiSecret || !supabaseUrl || !serviceKey) {
    return res.status(503).json({ success: false, error: 'Cloudinary or Supabase server configuration is missing.' });
  }
  if (!mediaAssetId) return res.status(400).json({ success: false, error: 'Media asset ID is required.' });

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: asset, error: lookupError } = await supabase
    .from('media_assets')
    .select('public_id, resource_type')
    .eq('id', mediaAssetId)
    .eq('user_id', user.id)
    .single();

  if (lookupError || !asset?.public_id) {
    return res.status(404).json({ success: false, error: 'Media asset was not found.' });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const signature = createHmac('sha1', apiSecret)
    .update(`public_id=${asset.public_id}&timestamp=${timestamp}`)
    .digest('hex');
  const resourceType = asset.resource_type || 'image';
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ public_id: asset.public_id, api_key: apiKey, timestamp, signature }),
  });
  const result = await response.json();
  if (!response.ok || result.result === 'error' || result.error) {
    return res.status(502).json({ success: false, error: result.error?.message || 'Cloudinary deletion failed.' });
  }

  const { error: deleteError } = await supabase.from('media_assets').delete().eq('id', mediaAssetId).eq('user_id', user.id);
  if (deleteError) return res.status(500).json({ success: false, error: 'Media metadata could not be deleted.' });
  return res.json({ success: true, data: result });
}