import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const SYSTEM =
  "Kamu asisten AI ramah. Jawab singkat dan membantu dalam bahasa Indonesia.";

const GROQ_MODELS = [
  "llama-3.1-8b-instant",
  "openai/gpt-oss-120b",
  "llama-3.3-70b-versatile",
];

export async function POST(req: Request) {
  try {
    const { messages, provider = "groq" } = await req.json();

    if (provider === "gemini") {
      const apiKey = process.env.GEMINI_KEY;
      if (!apiKey) {
        return Response.json(
          { error: "Secret GEMINI_KEY belum diset di Cloudflare." },
          { status: 500 }
        );
      }
      const google = createGoogleGenerativeAI({ apiKey });
      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system: SYSTEM,
        messages,
      });
      return Response.json({ reply: text });
    }

    const apiKey = process.env.GROQ_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Secret GROQ_KEY belum diset di Cloudflare." },
        { status: 500 }
      );
    }
    const groq = createGroq({ apiKey });

    let lastError: unknown = null;
    for (const namaModel of GROQ_MODELS) {
      try {
        const { text } = await generateText({
          model: groq(namaModel),
          system: SYSTEM,
          messages,
        });
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
