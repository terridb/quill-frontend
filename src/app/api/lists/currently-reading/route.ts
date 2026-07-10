import { getCurrentlyReading } from "@/src/lib/lists/get-currently-reading";
import { createClient } from "@/src/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { listId, books } = await getCurrentlyReading(user.id);
    return Response.json({ listId, books });
  } catch {
    return Response.json(
      { error: "Unable to load currently reading list" },
      { status: 500 },
    );
  }
}
