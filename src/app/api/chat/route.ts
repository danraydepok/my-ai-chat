import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai muramsyah";

const SYSTEM =
  "Kamu asisten AI ramah dan membantu. Jawab dalam bahasa Indonesia sebagai teks polos: jangan pakai markdown, tanda bintang, backtick, atau simbol format lain.";

const GROQ_MODELS = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "llama-3.1-8b-instant",
];

const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
];

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const adaGambar = messages.some(
      (m: any) =>
        Array.isArray(m.content) &&
        m.content.some((p: any) => p && p.type === "image")
    );

    const percobaan: Array<{ nama: string; jalan: () => Promise<string> }> = [];

    const groqKey = process.env.GROQ_KEY;
    if (groqKey) {
      const groq = createGroq({ apiKey: groqKey });
      for (const model of GROQ_MODELS) {
        percobaan.push({
          nama: "groq/" + model,
          jalan: () =>
            generateText({ model: groq(model), system: SYSTEM, messages }).then(
              (r) => r.text
            ),
        });
      }
    }

    const geminiKey = process.env.GEMINI_KEY;
    if (geminiKey) {
      const google = createGoogleGenerativeAI({ apiKey: geminiKey });
      for (const model of GEMINI_MODELS) {
        percobaan.push({
          nama: "gemini/" + model,
          jalan: () =>
            generateText({ model: google(model), system: SYSTEM, messages }).then(
              (r) => r.text
            ),
        });
      }
    }

    if (percobaan.length === 0) {
      return Response.json(
        { error: "Secret GROQ_KEY / GEMINI_KEY belum diset di Cloudflare." },
        { status: 500 }
      );
    }

    const urutan = adaGambar
      ? [
          ...percobaan.filter((p) => p.nama.startsWith("gemini")),
          ...percobaan.filter((p) => p.nama.startsWith("groq")),
        ]
      : percobaan;

    let lastError: unknown = null;
    for (const p of urutan) {
      try {
        const text = await p.jalan();
        return Response.json({ reply: text });
      } catch (e) {
        lastError = e;
      }
    }
    throw lastError;
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
