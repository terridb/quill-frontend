import { getBookLibraryForUser } from "@/src/lib/books/get-book-library";
import {
  updateBookLibrary,
  updateBookLibrarySchema,
} from "@/src/lib/books/update-book-library";
import { createClient } from "@/src/lib/supabase/server";

type RouteContext = {
  params: Promise<{ bookId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { bookId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const library = await getBookLibraryForUser(supabase, user.id, bookId);
    return Response.json(library);
  } catch {
    return Response.json({ error: "Unable to load library" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { bookId } = await context.params;
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

  const parsed = updateBookLibrarySchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    await updateBookLibrary(supabase, user.id, bookId, parsed.data);
    const library = await getBookLibraryForUser(supabase, user.id, bookId);
    return Response.json(library);
  } catch {
    return Response.json({ error: "Unable to update library" }, { status: 500 });
  }
}
