import type { SupabaseClient } from "@supabase/supabase-js";
import type { UIMessage } from "ai";
import type { Database } from "@/src/types/database";

export type AiToolSupabase = SupabaseClient<Database>;

export interface AiToolContext {
  supabase: AiToolSupabase;
  userId: string;
  /** Recent UI messages — used to scope referential “add those” mutations. */
  messages?: UIMessage[];
}
