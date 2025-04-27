// app/collections/[handle]/page.jsx
import { fetchCollectionByHandle } from '@/lib/fetchProducts';
import ProductCard from '@/components/ProductCard';

export default async function CollectionPage(props) {
  const { handle } = await props.params; // ✅ await the params!

  const collectionData = await fetchCollectionByHandle(handle);

  if (!collectionData) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold">Collection not found</h1>
      </div>
    );
  }

  const { collection, products } = collectionData;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{collection.title}</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
