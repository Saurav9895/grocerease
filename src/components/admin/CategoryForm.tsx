
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Category, UserProfile } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { createCategory, updateCategory } from "@/lib/data";

interface CategoryFormProps {
  category?: Category | null;
  onSuccess: () => void;
  profile: UserProfile | null;
}

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid image URL."),
});

export function CategoryForm({ category, onSuccess, profile }: CategoryFormProps) {
  const isEditing = !!category;
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState(category?.imageUrl || 'https://placehold.co/100x100.png');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setImageUrl(category?.imageUrl || 'https://placehold.co/100x100.png');
  }, [category]);


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const rawFormData = Object.fromEntries(formData.entries());

    const validatedFields = categorySchema.safeParse(rawFormData);
    
    if (!validatedFields.success) {
      const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).flat().join('\n');
      toast({
        variant: "destructive",
        title: "Invalid data",
        description: errorMessages || "Please check the form fields.",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isEditing && category) {
        await updateCategory(category.id, validatedFields.data);
      } else {
        const vendorId = profile?.adminRole === 'vendor' ? profile.vendorId : null;
        await createCategory(validatedFields.data, vendorId);
      }

      toast({
        title: `Category ${isEditing ? 'updated' : 'added'}`,
        description: `The category has been successfully ${isEditing ? 'updated' : 'added'}.`,
      });
      onSuccess();

    } catch (error) {
       console.error("Error saving category:", error);
       toast({
        variant: "destructive",
        title: "Failed to save category",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isPreviewable = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
      
      {/* Left Column */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input id="name" name="name" defaultValue={category?.name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={category?.description} placeholder="Optional description..." rows={5} />
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input 
            id="imageUrl" 
            name="imageUrl" 
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required 
          />
        </div>
        {isPreviewable(imageUrl) && (
          <div className="space-y-2">
              <Label>Image Preview</Label>
              <div className="relative aspect-square w-full rounded-md overflow-hidden border bg-muted">
                  <Image
                      src={imageUrl}
                      alt="Category preview"
                      fill
                      className="object-cover"
                      onError={() => setImageUrl('https://placehold.co/100x100.png')}
                      data-ai-hint="category image"
                  />
              </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="md:col-span-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Category' : 'Add Category')}
        </Button>
      </div>
    </form>
  );
}
