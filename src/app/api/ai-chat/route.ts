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
import { buildAiChatSystemPrompt } from "@/src/lib/ai/system-prompt";
import { isValidFinishedDate } from "@/src/lib/books/set-reading-status";
import { formatLocalDate } from "@/src/lib/reading/format-local-date";
import { createClient } from "@/src/lib/supabase/server";

export const maxDuration = 60;

const MAX_MESSAGES = 20;

const chatBodySchema = z.object({
  messages: z.array(z.unknown()).min(1),
  /** User's local calendar date (YYYY-MM-DD) for resolving "today" / "yesterday". */
  clientToday: z.string().optional(),
});

function extractTextFromUIMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function resolveToday(clientToday: string | undefined): string {
  if (clientToday && isValidFinishedDate(clientToday)) {
    return clientToday;
  }
  return formatLocalDate(new Date());
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
  const today = resolveToday(parsed.data.clientToday);

  const tools = createChatTools({
    supabase,
    userId: user.id,
    messages: recentMessages,
  });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: buildAiChatSystemPrompt(today),
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
