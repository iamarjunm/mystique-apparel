// app/collections/[handle]/page.jsx
import { fetchCollectionByHandle } from '@/lib/fetchProducts';
import ProductCard from '@/components/ProductCard';

export default async function CollectionPage(props) {
  const { handle } = await props.params;

  const collectionData = await fetchCollectionByHandle(handle);

  if (!collectionData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Collection not found</h1>
          <p className="text-gray-400">The collection you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { collection, products } = collectionData;

  return (
    <div className="min-h-screen bg-black text-white py-12">
      <div className="container mx-auto px-4">
        {/* Collection Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold uppercase tracking-[0.25em] mb-4">
            {collection.title}
          </h1>
          <p className="text-gray-400 text-lg">
            {products.length} {products.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">No products available in this collection yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
