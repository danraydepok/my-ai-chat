import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const SYSTEM =
  "Nama kamu Muramsyah AI, asisten pribadi ramah. " +
  "Jawab dalam bahasa Indonesia dengan teks polos, " +
  "tanpa markdown, tanda bintang, atau backtick.";

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

    const adaGambar = messages.some((m: any) =>
      Array.isArray(m.content)
        ? m.content.some(
            (p: any) => p && p.type === "image"
          )
        : false
    );

    const groqKey = process.env.GROQ_KEY;
    const geminiKey = process.env.GEMINI_KEY;

    if (!groqKey && !geminiKey) {
      return Response.json(
        {
          error:
            "Secret GROQ_KEY / GEMINI_KEY belum diset.",
        },
        { status: 500 }
      );
    }

    const daftar: string[] = [];
    if (groqKey) daftar.push("groq");
    if (geminiKey) daftar.push("gemini");
    if (adaGambar) daftar.reverse();

    let lastError: unknown = null;

    for (const mesin of daftar) {
      if (mesin === "groq" && groqKey) {
        const groq = createGroq({ apiKey: groqKey });
        for (const model of GROQ_MODELS) {
          try {
            const r = await generateText({
              model: groq(model),
              system: SYSTEM,
              messages,
            });
            return Response.json({ reply: r.text });
          } catch (e) {
            lastError = e;
          }
        }
      }

      if (mesin === "gemini" && geminiKey) {
        const google = createGoogleGenerativeAI({
          apiKey: geminiKey,
        });
        for (const model of GEMINI_MODELS) {
          try {
            const r = await generateText({
              model: google(model),
              system: SYSTEM,
              messages,
            });
            return Response.json({ reply: r.text });
          } catch (e) {
            lastError = e;
          }
        }
      }
    }

    throw lastError;
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
