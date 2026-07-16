import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { after } from "next/server";
import { z } from "zod";
import { createChatTools } from "@/src/lib/ai/create-chat-tools";
import { logRecommendation } from "@/src/lib/ai/log-recommendation";
import { AI_CHAT_SYSTEM_PROMPT } from "@/src/lib/ai/system-prompt";
import { createClient } from "@/src/lib/supabase/server";

export const maxDuration = 60;

const MAX_MESSAGES = 20;

const chatBodySchema = z.object({
  messages: z.array(z.unknown()).min(1),
});

function extractTextFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not configured");
    return Response.json(
      { error: "Recommendations are temporarily unavailable." },
      { status: 500 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = chatBodySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "Invalid chat messages" }, { status: 400 });
  }

  const messages = parsed.data.messages as UIMessage[];
  const recentMessages = messages.slice(-MAX_MESSAGES);

  const tools = createChatTools({ supabase, userId: user.id });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: AI_CHAT_SYSTEM_PROMPT,
    messages: await convertToModelMessages(recentMessages),
    tools,
    stopWhen: stepCountIs(16),
  });

  after(async () => {
    try {
      const lastUser = [...recentMessages]
        .reverse()
        .find((message) => message.role === "user");
      const prompt = lastUser ? extractTextFromUIMessage(lastUser) : "";
      const recommendation = (await result.text).trim();

      await logRecommendation(supabase, user.id, prompt, recommendation);
    } catch (error) {
      console.error("AI recommendation audit log failed:", error);
    }
  });

  return result.toUIMessageStreamResponse();
}
