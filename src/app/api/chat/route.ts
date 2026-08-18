import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Secret GROQ_KEY belum diset di Cloudflare." },
        { status: 500 }
      );
    }

    const groq = createGroq({ apiKey });

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system:
        "Kamu asisten AI ramah. Jawab singkat dan membantu dalam bahasa Indonesia.",
      messages,
    });

    return Response.json({ reply: text });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
