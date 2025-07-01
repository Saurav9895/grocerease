import { CategoryTable } from "@/components/admin/CategoryTable";
import { getCategories } from "@/lib/data";

export const revalidate = 0; // Revalidate on every request

export default async function AdminCategoriesPage() {
  const allCategories = await getCategories();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manage Categories</h1>
      <CategoryTable categories={allCategories} />
    </div>
  );
}
