import { formatLocalDate } from "@/src/lib/reading/format-local-date";
import { getReadingTracker } from "@/src/lib/reading/get-reading-tracker";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get("weekStart");
  const weekEnd = searchParams.get("weekEnd");
  const today = searchParams.get("today") ?? formatLocalDate(new Date());

  if (!weekStart || !weekEnd) {
    return Response.json(
      { error: "weekStart and weekEnd are required" },
      { status: 400 },
    );
  }

  try {
    const tracker = await getReadingTracker(
      user.id,
      weekStart,
      weekEnd,
      today,
    );
    return Response.json(tracker);
  } catch {
    return Response.json({ error: "Unable to load tracker" }, { status: 500 });
  }
}
