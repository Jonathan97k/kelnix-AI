export default async function handler(req, res) {
  try {
    // Test 1: Basic crypto
    const crypto = await import("crypto");
    const hmac = crypto.createHmac("sha1", "test");
    const sig = hmac.update("test").digest("hex");
    
    // Test 2: Dynamic import of @supabase/supabase-js
    let supabaseClient;
    try {
      const { createClient } = await import("@supabase/supabase-js");
      supabaseClient = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
      );
    } catch (e) {
      return res.json({ step: "supabase_import", error: e.message, stack: e.stack });
    }
    
    // Test 3: Test getUser
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      try {
        const { data: { user: u }, error } = await supabaseClient.auth.getUser(token);
        if (!error && u) user = u;
      } catch (e) {
        return res.json({ step: "get_user", error: e.message, stack: e.stack });
      }
    }
    
    res.json({ status: "ok", crypto_works: !!sig, supabase_works: !!supabaseClient, user: user?.id || null });
  } catch (e) {
    res.json({ step: "outer", error: e.message, stack: e.stack });
  }
}