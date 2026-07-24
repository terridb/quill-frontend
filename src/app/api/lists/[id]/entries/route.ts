import {
  removeListEntries,
  removeListEntriesSchema,
} from "@/src/lib/lists/remove-list-entries";
import { createClient } from "@/src/lib/supabase/server";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
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

  const parsed = removeListEntriesSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { id: listId } = await context.params;

  try {
    const result = await removeListEntries(supabase, user.id, listId, parsed.data);

    if (result.removedIds.length === 0) {
      return Response.json({ error: "No matching books found" }, { status: 404 });
    }

    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to remove books from list";

    if (message === "List not found") {
      return Response.json({ error: message }, { status: 404 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
