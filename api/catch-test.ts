// @ts-nocheck
// Intentionally no TypeScript to test if esbuild handles it differently

export default async function handler(req, res) {
  try {
    // Test 1: Can we import _lib/auth?
    let authModule;
    try {
      authModule = await import("./_lib/auth");
      console.log("[CATCH] auth module loaded:", Object.keys(authModule));
    } catch (e) {
      return res.json({ step: "import_auth", error: e.message, stack: e.stack });
    }

    // Test 2: Can we call getApiUser?
    try {
      const user = await authModule.getApiUser(req);
      console.log("[CATCH] getApiUser returned:", user);
    } catch (e) {
      return res.json({ step: "getApiUser", error: e.message, stack: e.stack });
    }

    // Test 3: Can we import _lib/ai?
    try {
      const aiModule = await import("./_lib/ai");
      console.log("[CATCH] ai module loaded:", Object.keys(aiModule));
    } catch (e) {
      return res.json({ step: "import_ai", error: e.message, stack: e.stack });
    }

    res.json({ status: "all imports worked" });
  } catch (e) {
    res.json({ step: "outer", error: e.message, stack: e.stack });
  }
}
