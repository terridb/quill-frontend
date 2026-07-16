import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

type TypedSupabaseClient = SupabaseClient<Database>;

export async function logRecommendation(
  supabase: TypedSupabaseClient,
  userId: string,
  prompt: string,
  recommendation: string,
): Promise<void> {
  const trimmedPrompt = prompt.trim();
  const trimmedRecommendation = recommendation.trim();

  if (!trimmedPrompt || !trimmedRecommendation) {
    return;
  }

  const { error } = await supabase.from("ai_recommendations").insert({
    user_id: userId,
    prompt: trimmedPrompt,
    recommendation: trimmedRecommendation,
  });

  if (error) {
    console.error("Failed to log AI recommendation:", error.message);
  }
}
