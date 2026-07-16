import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/src/types/database";

export type AiToolSupabase = SupabaseClient<Database>;

export interface AiToolContext {
  supabase: AiToolSupabase;
  userId: string;
}
