import { HomePage } from "@/src/components/home/HomePage";
import { formatLocalDate } from "@/src/lib/reading/format-local-date";
import { getReadingTracker } from "@/src/lib/reading/get-reading-tracker";
import { getWeekRange } from "@/src/lib/reading/get-week-range";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/");
  }

  const now = new Date();
  const { weekStart, weekEnd } = getWeekRange(now);
  const today = formatLocalDate(now);
  const tracker = await getReadingTracker(user.id, weekStart, weekEnd, today);

  return <HomePage initialTracker={tracker} />;
}
