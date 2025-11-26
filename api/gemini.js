// api/gemini.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) return res.status(500).json({ error: "GEMINI_API_KEY no configurada" });

  try {
    const body = req.body;
    if (!body || !body.profileText) return res.status(400).json({ error: "profileText faltante" });

    const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_KEY}`;

    const RESPONSE_SCHEMA = {
      type: "OBJECT",
      properties: {
        "pairing_suggestion": { "type": "STRING" },
        "marketing_description": { "type": "STRING" }
      }
    };

    const systemPrompt = `Eres un experto mundial en cata de café y marketing de especialidad. Genera en español: pairing_suggestion y marketing_description (3 oraciones).`;
    const userQuery = `El perfil de sabor del café es: "${body.profileText}". Genera el maridaje y la descripción.`;

    const payload = {
      contents: [{ parts: [{ text: userQuery }] }],
      tools: [{ "google_search": {} }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    };

    const resp = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(resp.status).json({ error: "Error Gemini", body: txt });
    }

    const json = await resp.json();
    const candidate = json.candidates?.[0];
    if (candidate && candidate.content?.parts?.[0]?.text) {
      const parsed = JSON.parse(candidate.content.parts[0].text);
      return res.status(200).json(parsed);
    } else {
      return res.status(500).json({ error: "Respuesta inesperada de Gemini", raw: json });
    }

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}
