import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";

const groq = createGroq({ apiKey: process.env.GROQ_KEY });

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system:
        "Kamu asisten AI ramah. Jawab singkat dan membantu dalam bahasa Indonesia.",
      messages,
    });

    return result.toDataStreamResponse();
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 });
  }
}
