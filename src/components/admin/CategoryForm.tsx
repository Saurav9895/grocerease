"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/lib/types";
import { addCategory, updateCategory } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Category' : 'Add Category')}
    </Button>
  );
}

export function CategoryForm({ category, onSuccess }: CategoryFormProps) {
  const isEditing = !!category;
  const { toast } = useToast();

  const formAction = async (formData: FormData) => {
    const action = isEditing ? updateCategory : addCategory;
    const result = await action(formData);

    if (result.success) {
      toast({
        title: `Category ${isEditing ? 'updated' : 'added'}`,
        description: `The category has been successfully ${isEditing ? 'updated' : 'added'}.`,
      });
      onSuccess();
    } else {
      const errorMessages = Object.values(result.errors || {}).flat().join('\n');
      toast({
        variant: "destructive",
        title: "Failed to save category",
        description: errorMessages || "An unexpected error occurred.",
      });
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      {isEditing && <input type="hidden" name="id" value={category.id} />}
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input id="name" name="name" defaultValue={category?.name} required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={category?.description} placeholder="Optional description..." />
      </div>
       <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" name="imageUrl" defaultValue={category?.imageUrl || 'https://placehold.co/100x100.png'} required />
      </div>
      <SubmitButton isEditing={isEditing} />
    </form>
  );
}
