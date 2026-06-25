import { redirect } from 'next/navigation';

export default function CategoryPage({ params }) {
  redirect(`/shop?category=${params.handle}`);
}
