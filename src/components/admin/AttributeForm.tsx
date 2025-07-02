"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { AttributeSet } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { X, Plus } from "lucide-react";
import { createAttribute, updateAttribute } from "@/lib/data";

interface AttributeFormProps {
  attributeSet?: AttributeSet | null;
  onSuccess: () => void;
}

const attributeSetSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  values: z.array(z.string()).min(1, "At least one value is required."),
});

export function AttributeForm({ attributeSet, onSuccess }: AttributeFormProps) {
  const isEditing = !!attributeSet;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [values, setValues] = useState<string[]>([]);
  const [currentValue, setCurrentValue] = useState('');

  useEffect(() => {
    if (attributeSet) {
      setName(attributeSet.name);
      setValues(attributeSet.values);
    } else {
      setName('');
      setValues([]);
    }
  }, [attributeSet]);

  const handleAddValue = () => {
    const trimmedValue = currentValue.trim();
    if (trimmedValue && !values.includes(trimmedValue)) {
      setValues([...values, trimmedValue]);
      setCurrentValue('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    setValues(values.filter(value => value !== valueToRemove));
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const validatedFields = attributeSetSchema.safeParse({ name, values });
    
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
          placeholder="e.g., Weight, Color"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
      </div>
      
      <div className="space-y-2">
          <Label htmlFor="value-input">Attribute Values</Label>
          <div className="flex gap-2">
            <Input
                id="value-input"
                placeholder="e.g., 500gm, 1kg"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddValue();
                    }
                }}
            />
            <Button type="button" variant="outline" onClick={handleAddValue}>
                <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </div>
      </div>
      
      {values.length > 0 && (
        <div className="space-y-2">
            <Label>Current Values</Label>
            <div className="flex flex-wrap gap-2 p-3 rounded-md border bg-muted/50 min-h-[40px]">
                {values.map((value, index) => (
                    <Badge key={index} variant="secondary" className="text-base">
                        {value}
                        <button type="button" onClick={() => handleRemoveValue(value)} className="ml-2 rounded-full hover:bg-destructive/20 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
      )}

      <div className="pt-4">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Attribute' : 'Add Attribute')}
        </Button>
      </div>
    </form>
  );
}
