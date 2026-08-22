import type { VercelRequest, VercelResponse } from '@vercel/node';

// Lazy-load @supabase/supabase-js to avoid module-level crashes on Vercel
let serverSupabase: any = null;
let supabaseLoaded = false;

async function getSupabase() {
  if (supabaseLoaded) return serverSupabase;
  supabaseLoaded = true;
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseKey) {
      serverSupabase = createClient(supabaseUrl, supabaseKey);
    }
  } catch (err) {
    console.warn('[Auth] Failed to load @supabase/supabase-js:', err);
  }
  return serverSupabase;
}

// Firebase Admin — lazy-loaded to avoid crashing serverless functions
let firebaseAdminApp: any = null;
let firebaseLoadAttempted = false;

async function getFirebaseApp() {
  if (firebaseAdminApp) return firebaseAdminApp;
  if (firebaseLoadAttempted) return null;
  firebaseLoadAttempted = true;

  try {
    const { initializeApp, cert, getApps, applicationDefault } = await import('firebase-admin/app');

    if (getApps().length > 0) {
      firebaseAdminApp = getApps()[0];
      return firebaseAdminApp;
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      firebaseAdminApp = initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('[Auth] Firebase Admin initialized with service account.');
      return firebaseAdminApp;
    } else {
      firebaseAdminApp = initializeApp({ credential: applicationDefault() });
      console.log('[Auth] Firebase Admin initialized with default credentials.');
      return firebaseAdminApp;
    }
  } catch (err) {
    console.warn('[Auth] Firebase Admin not configured. Firebase token verification disabled.');
    return null;
  }
}

async function verifyFirebaseToken(token: string): Promise<{ id: string; email?: string } | null> {
  const app = await getFirebaseApp();
  if (!app) return null;

  try {
    const { getAuth } = await import('firebase-admin/auth');
    const decodedToken = await getAuth(app).verifyIdToken(token);
    return {
      id: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (err) {
    console.error('[Auth] Firebase token verification failed:', err);
    return null;
  }
}

async function verifySupabaseToken(token: string): Promise<{ id: string; email?: string } | null> {
  const supabase = await getSupabase();
  if (!supabase) return null;

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email,
  };
}

export interface ApiUser {
  id: string;
  email?: string;
  provider: 'firebase' | 'supabase';
}

export async function getApiUser(req: VercelRequest): Promise<ApiUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  // Try Supabase first (shorter tokens)
  const supabaseUser = await verifySupabaseToken(token);
  if (supabaseUser) {
    return { ...supabaseUser, provider: 'supabase' };
  }

  // Try Firebase (longer JWT tokens)
  const firebaseUser = await verifyFirebaseToken(token);
  if (firebaseUser) {
    return { ...firebaseUser, provider: 'firebase' };
  }

  return null;
}

export async function requireApiUser(req: VercelRequest, res: VercelResponse): Promise<ApiUser | false> {
  // If no auth providers are configured, allow through for dev mode
  const supabase = await getSupabase();
  if (!supabase && !firebaseLoadAttempted) {
    const app = await getFirebaseApp();
    if (!app) {
      return { id: 'dev-user', provider: 'supabase' };
    }
  } else if (!supabase && firebaseLoadAttempted && !firebaseAdminApp) {
    return { id: 'dev-user', provider: 'supabase' };
  }

  const user = await getApiUser(req);
  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid or expired session.' });
    return false;
  }

  return user;
}
