// app/category/[handle]/page.jsx
import { fetchProductsByCategory } from '@/lib/fetchProducts';
import ProductCard from '@/components/ProductCard';

export default async function CategoryPage(props) {
  const { handle } = props.params; // destructure after
  const categoryData = await fetchProductsByCategory(handle);

  if (!categoryData) {
    return <div className="text-center py-12">Category not found</div>;
  }

  const { collection, products } = categoryData;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6 text-center">{collection.title}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
