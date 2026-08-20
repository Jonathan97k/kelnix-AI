import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (isSupabaseConfigured && supabase) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('The service is unavailable. Check your connection and try again.', 0);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError('The service returned an unexpected response. Please try again.', response.status);
  }

  const data = await response.json().catch(() => null) as { success?: boolean; error?: string; data?: T } | null;
  if (!data) {
    throw new ApiError('The service returned an empty response. Please try again.', response.status);
  }
  if (!response.ok || data.success === false) {
    throw new ApiError(data.error || 'The request failed. Please try again.', response.status);
  }

  return (data.data === undefined ? data : data.data) as T;
}
