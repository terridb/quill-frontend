type BookPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BookPage({ params }: BookPageProps) {
  await params;

  return <div />;
}
