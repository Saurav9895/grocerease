"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategories } from "@/lib/data";
import type { Product, Category } from "@/lib/types";
import { addProduct, updateProduct } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Product' : 'Add Product')}
    </Button>
  );
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const isEditing = !!product;
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []);

  const formAction = async (formData: FormData) => {
    const action = isEditing ? updateProduct : addProduct;
    const result = await action(formData);

    if (result.success) {
      toast({
        title: `Product ${isEditing ? 'updated' : 'added'}`,
        description: `The product has been successfully ${isEditing ? 'updated' : 'added'}.`,
      });
      onSuccess();
    } else {
      const errorMessages = Object.values(result.errors || {}).flat().join('\n');
      toast({
        variant: "destructive",
        title: "Failed to save product",
        description: errorMessages || "An unexpected error occurred.",
      });
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" name="name" defaultValue={product?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={product?.description} required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" defaultValue={product?.stock} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={product?.category}>
            <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
                {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" name="imageUrl" defaultValue={product?.imageUrl || 'https://placehold.co/600x400.png'} required />
      </div>
      <SubmitButton isEditing={isEditing} />
    </form>
  );
}
