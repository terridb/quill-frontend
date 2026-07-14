import { formatLocalDate } from "@/src/lib/reading/format-local-date";
import {
  updateListEntryProgress,
  updateListEntryProgressSchema,
} from "@/src/lib/reading/update-list-entry-progress";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{ entryId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { entryId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = updateListEntryProgressSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const loggedDate = parsed.data.loggedDate ?? formatLocalDate(new Date());

  try {
    await updateListEntryProgress(
      supabase,
      user.id,
      entryId,
      parsed.data,
      loggedDate,
    );
    return Response.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update progress";
    const status = message === "List entry not found" ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}
