import { redirect } from "next/navigation";

export default async function CollectionPage({ params }) {
  const { handle } = await params;
  redirect(`/shop?collection=${handle}`);
}
