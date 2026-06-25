import { redirect } from 'next/navigation';

export default function CollectionPage({ params }) {
  redirect(`/shop?collection=${params.handle}`);
}
