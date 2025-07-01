import { products } from "@/lib/data";
import { ProductTable } from "@/components/admin/ProductTable";

export default function AdminProductsPage() {
  // In a real app, this data would be fetched from Firebase
  const allProducts = products;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
      <ProductTable products={allProducts} />
    </div>
  );
}
