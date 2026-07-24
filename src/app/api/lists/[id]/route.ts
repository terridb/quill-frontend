import { deleteList } from "@/src/lib/lists/delete-list";
import { getListDetail } from "@/src/lib/lists/get-list-detail";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const detail = await getListDetail(user.id, id);

    if (!detail) {
      return Response.json({ error: "List not found" }, { status: 404 });
    }

    return Response.json(detail);
  } catch {
    return Response.json({ error: "Unable to load list" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteList(supabase, user.id, id);
    return new Response(null, { status: 204 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete list";

    if (message === "List not found") {
      return Response.json({ error: message }, { status: 404 });
    }

    if (message === "Default lists cannot be deleted") {
      return Response.json({ error: message }, { status: 403 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
