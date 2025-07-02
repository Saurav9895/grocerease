"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AttributeSet } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { createAttribute, updateAttribute } from "@/lib/data";

interface AttributeFormProps {
  attributeSet?: AttributeSet | null;
  onSuccess: () => void;
}

const attributeSetSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
});

export function AttributeForm({ attributeSet, onSuccess }: AttributeFormProps) {
  const isEditing = !!attributeSet;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState('');

  useEffect(() => {
    if (attributeSet) {
      setName(attributeSet.name);
    } else {
      setName('');
    }
  }, [attributeSet]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const validatedFields = attributeSetSchema.safeParse({ name });
    
    if (!validatedFields.success) {
      const errorMessage = validatedFields.error.flatten().fieldErrors.name?.[0];
      toast({
        variant: "destructive",
        title: "Invalid data",
        description: errorMessage || "Please check the form fields.",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isEditing && attributeSet) {
        await updateAttribute(attributeSet.id, validatedFields.data);
      } else {
        await createAttribute(validatedFields.data);
      }

      toast({
        title: `Attribute ${isEditing ? 'updated' : 'added'}`,
        description: `The attribute has been successfully ${isEditing ? 'updated' : 'added'}.`,
      });
      onSuccess();

    } catch (error) {
       console.error("Error saving attribute:", error);
       toast({
        variant: "destructive",
        title: "Failed to save attribute",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Attribute Name</Label>
        <Input 
          id="name" 
          name="name"
          placeholder="e.g., Weight, Color, Brand"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Attribute' : 'Add Attribute')}
        </Button>
      </div>
    </form>
  );
}
