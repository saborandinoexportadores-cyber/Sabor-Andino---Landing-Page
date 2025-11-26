// api/config.js
export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const firebaseConfig = process.env.FIREBASE_CONFIG;
  const appId = process.env.APP_ID || "default-app-id";
  const initialAuthToken = process.env.INITIAL_AUTH_TOKEN || null;

  if (!firebaseConfig) {
    return res.status(500).json({ error: "FIREBASE_CONFIG no configurada" });
  }

  try {
    const parsed = JSON.parse(firebaseConfig);
    return res.status(200).json({
      firebaseConfig: parsed,
      appId,
      initialAuthToken
    });
  } catch (err) {
    return res.status(500).json({ error: "FIREBASE_CONFIG inválida: debe ser JSON stringificado" });
  }
}
