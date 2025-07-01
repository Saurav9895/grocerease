import { ProductTable } from "@/components/admin/ProductTable";
import { getProducts } from "@/lib/data";

export const revalidate = 0; // Revalidate on every request

export default async function AdminProductsPage() {
  const allProducts = await getProducts();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
      <ProductTable products={allProducts} />
    </div>
  );
}
