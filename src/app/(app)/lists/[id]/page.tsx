import { ListDetailPage } from "@/src/components/lists/ListDetailPage";
import { getListDetail } from "@/src/lib/lists/get-list-detail";
import { createClient } from "@/src/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export default async function ListDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/lists/${id}`)}`);
  }

  const detail = await getListDetail(user.id, id);

  if (!detail) {
    notFound();
  }

  return <ListDetailPage listId={id} initialDetail={detail} />;
}
