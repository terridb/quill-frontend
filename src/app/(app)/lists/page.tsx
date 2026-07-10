import { ListsOverviewPage } from "@/src/components/lists/ListsOverviewPage";
import { getListsOverview } from "@/src/lib/lists/get-lists-overview";
import { createClient } from "@/src/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/lists");
  }

  const overview = await getListsOverview(user.id);

  return <ListsOverviewPage initialOverview={overview} />;
}
