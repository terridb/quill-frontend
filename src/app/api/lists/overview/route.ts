import { getListsOverview } from "@/src/lib/lists/get-lists-overview";
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
    const overview = await getListsOverview(user.id);
    return Response.json(overview);
  } catch {
    return Response.json({ error: "Unable to load lists" }, { status: 500 });
  }
}
