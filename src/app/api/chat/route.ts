import { groq } from '@ai-sdk/groq';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, model } = await req.json();

  let selectedModel;

  if (model?.startsWith('gemini')) {
    selectedModel = google(model);
  } else {
    selectedModel = groq(model || 'llama-3.3-70b-versatile');
  }

  const result = streamText({
    model: selectedModel,
    messages,
    system: `Kamu adalah asisten AI yang pintar, jujur, dan helpful. 
Jawab dalam bahasa yang sama dengan user. 
Kamu mirip Grok — langsung, jelas, dan bisa membahas topik apa saja.`,
  });

  return result.toDataStreamResponse();
}
