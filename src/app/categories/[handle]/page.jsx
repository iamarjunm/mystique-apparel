import { redirect } from "next/navigation";

export default async function CategoryPage({ params }) {
  const { handle } = await params;
  redirect(`/shop?category=${handle}`);
}
