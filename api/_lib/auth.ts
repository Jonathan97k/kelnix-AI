import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const serverSupabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function getApiUser(req: VercelRequest): Promise<{ id: string } | null> {
  if (!serverSupabase) return null;

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const { data: { user }, error } = await serverSupabase.auth.getUser(token);
  if (error || !user) return null;

  return { id: user.id };
}

export async function requireApiUser(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  if (!serverSupabase) return true;

  const user = await getApiUser(req);
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid or expired session.' });
    return false;
  }

  return true;
}
