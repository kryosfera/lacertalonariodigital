import { ProductCard } from "./ProductCard";

interface Product {
  id: string;
  name: string;
  reference: string;
  thumbnail_url?: string | null;
}

interface CategorySectionProps {
  name: string;
  products: Product[];
  selectedProducts: Set<string>;
  onToggleProduct: (id: string) => void;
}

export const CategorySection = ({
  name,
  products,
  selectedProducts,
  onToggleProduct,
}: CategorySectionProps) => {
  if (products.length === 0) return null;

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-white/90 uppercase tracking-wide mb-3 px-1">
        {name}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            reference={product.reference}
            thumbnailUrl={product.thumbnail_url}
            isSelected={selectedProducts.has(product.id)}
            onToggle={onToggleProduct}
          />
        ))}
      </div>
    </div>
  );
};
