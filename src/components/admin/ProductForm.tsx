
"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategories, getAttributes } from "@/lib/data";
import type { Product, Category, AttributeSet } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import Image from "next/image";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
}

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0.01, "Price must be a positive number."),
  category: z.string().min(1, "Please select a category."),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative number."),
  imageUrl: z.string().url("Please enter a valid image URL."),
});

type Attribute = {
  id: number;
  key: string;
  value: string;
};

type VariantData = Record<string, {
    price: string;
    stock: string;
    imageUrl: string;
}>

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!product;
  const { toast } = useToast();
  
  // Base product state
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || 'https://placehold.co/600x400.png');
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  // Variant state
  const [isVariant, setIsVariant] = useState(false);
  const [allAttributes, setAllAttributes] = useState<AttributeSet[]>([]);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string | undefined>();
  const [variants, setVariants] = useState<VariantData>({});


  useEffect(() => {
    const fetchInitialData = async () => {
      const [fetchedCategories, fetchedAttributes] = await Promise.all([
        getCategories(),
        getAttributes()
      ]);
      setCategories(fetchedCategories);
      setAllAttributes(fetchedAttributes);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (product) {
      setImageUrl(product.imageUrl);
      setAttributes(product.attributes ? Object.entries(product.attributes).map(([key, value], index) => ({ id: index, key, value })) : []);
      
      setIsVariant(product.isVariant || false);
      setSelectedAttributeId(product.variantAttributeId);
      if(product.variants){
         const initialVariantsState: VariantData = {};
         for (const [key, value] of Object.entries(product.variants)) {
            initialVariantsState[key] = {
                price: String(value.price),
                stock: String(value.stock),
                imageUrl: value.imageUrl,
            };
         }
         setVariants(initialVariantsState);
      }

    } else {
      // Reset form for new product
      setImageUrl('https://placehold.co/600x400.png');
      setAttributes([]);
      setIsVariant(false);
      setSelectedAttributeId(undefined);
      setVariants({});
    }
  }, [product]);

  const handleAddAttribute = () => {
    setAttributes(prev => [...prev, { id: Date.now(), key: '', value: '' }]);
  };

  const handleAttributeChange = (id: number, field: 'key' | 'value', value: string) => {
    setAttributes(prev => prev.map(attr => attr.id === id ? { ...attr, [field]: value } : attr));
  };

  const handleRemoveAttribute = (id: number) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id));
  };

  const handleVariantDataChange = (value: string, field: 'price' | 'stock' | 'imageUrl', fieldValue: string) => {
    setVariants(prev => ({
      ...prev,
      [value]: {
        ...(prev[value] || { price: '', stock: '', imageUrl: '' }),
        [field]: fieldValue,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const rawFormData = Object.fromEntries(formData.entries());

    const validatedFields = productSchema.safeParse(rawFormData);
    
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

    const attributesToSave = attributes
      .filter(attr => attr.key.trim() !== "")
      .reduce((acc, attr) => {
          acc[attr.key.trim()] = attr.value.trim();
          return acc;
      }, {} as Record<string, string>);

    let dataToSave: any = { 
        ...validatedFields.data, 
        attributes: attributesToSave,
        isVariant: isVariant,
    };

    if (isVariant) {
        if (!selectedAttributeId) {
            toast({ variant: 'destructive', title: 'Variant Error', description: 'Please select a variant attribute.' });
            setIsLoading(false);
            return;
        }

        const variantsToSave: Product['variants'] = {};
        const selectedAttr = allAttributes.find(a => a.id === selectedAttributeId);

        for (const value of selectedAttr?.values || []) {
            const variantData = variants[value];
            if (!variantData || !variantData.price || !variantData.stock || !variantData.imageUrl) {
                toast({ variant: 'destructive', title: 'Variant Error', description: `Please fill all fields for variant "${value}".` });
                setIsLoading(false);
                return;
            }
            variantsToSave[value] = {
                price: parseFloat(variantData.price),
                stock: parseInt(variantData.stock, 10),
                imageUrl: variantData.imageUrl,
            };
        }
        
        dataToSave = {
            ...dataToSave,
            variantAttributeId: selectedAttributeId,
            variants: variantsToSave,
        };
    } else {
        dataToSave = {
            ...dataToSave,
            variantAttributeId: null,
            variants: {},
        };
    }

    try {
      if (isEditing && product) {
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, dataToSave);
      } else {
        await addDoc(collection(db, "products"), {
          ...dataToSave,
          rating: 0,
          reviewCount: 0,
          createdAt: serverTimestamp()
        });
      }

      toast({
        title: `Product ${isEditing ? 'updated' : 'added'}`,
        description: `The product has been successfully ${isEditing ? 'updated' : 'added'}.`,
      });
      onSuccess();
      
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        variant: "destructive",
        title: "Failed to save product",
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
  };
  
  const selectedAttribute = allAttributes.find(attr => attr.id === selectedAttributeId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isEditing && <input type="hidden" name="id" value={product?.id} />}
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 grid gap-6">
          <Card className="p-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" name="name" defaultValue={product?.name} required />
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={product?.description} required rows={5} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{isVariant ? 'Base Price' : 'Price'}</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">{isVariant ? 'Base Stock' : 'Stock'}</Label>
                <Input id="stock" name="stock" type="number" defaultValue={product?.stock} required />
              </div>
            </div>
            <div className="space-y-2 mt-4">
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
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">{isVariant ? 'Base Image URL' : 'Image URL'}</Label>
                <Input 
                    id="imageUrl" 
                    name="imageUrl" 
                    value={imageUrl} 
                    onChange={(e) => setImageUrl(e.target.value)} 
                    required 
                />
              </div>
              {isPreviewable(imageUrl) && (
                <div className="space-y-2 mt-4">
                    <Label>Image Preview</Label>
                    <div className="relative aspect-square w-full rounded-md overflow-hidden border bg-muted">
                        <Image
                            src={imageUrl}
                            alt="Product preview"
                            fill
                            className="object-cover"
                            onError={() => setImageUrl('https://placehold.co/600x400.png')}
                            data-ai-hint="product image"
                        />
                    </div>
                </div>
              )}
            </Card>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <Checkbox id="isVariant" checked={isVariant} onCheckedChange={(checked) => setIsVariant(!!checked)} />
          <Label htmlFor="isVariant" className="text-base font-medium">This product has variants</Label>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Check this if the product comes in different versions like weight or color, each with its own price, stock, and image.</p>
      </Card>
      
      {isVariant && (
        <Card className="p-6">
            <h3 className="text-lg font-medium">Variant Configuration</h3>
            <p className="text-sm text-muted-foreground mb-4">Select an attribute and define the properties for each variant.</p>
            <Separator className="my-4" />
            <div className="space-y-4">
                <Label htmlFor="variant-attribute">Variant Attribute</Label>
                <Select onValueChange={setSelectedAttributeId} value={selectedAttributeId}>
                    <SelectTrigger id="variant-attribute">
                        <SelectValue placeholder="Select an attribute (e.g., Weight)" />
                    </SelectTrigger>
                    <SelectContent>
                        {allAttributes.map(attr => (
                            <SelectItem key={attr.id} value={attr.id}>{attr.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {selectedAttribute && (
                    <div className="space-y-6 pt-4">
                        {selectedAttribute.values.map(value => (
                            <div key={value} className="p-4 border rounded-md">
                                <h4 className="font-semibold text-primary">{value}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor={`variant-price-${value}`}>Price</Label>
                                        <Input id={`variant-price-${value}`} type="number" step="0.01" placeholder="Variant price"
                                            value={variants[value]?.price || ''}
                                            onChange={(e) => handleVariantDataChange(value, 'price', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`variant-stock-${value}`}>Stock</Label>
                                        <Input id={`variant-stock-${value}`} type="number" placeholder="Variant stock"
                                            value={variants[value]?.stock || ''}
                                            onChange={(e) => handleVariantDataChange(value, 'stock', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`variant-image-${value}`}>Image URL</Label>
                                        <Input id={`variant-image-${value}`} placeholder="Variant image URL"
                                            value={variants[value]?.imageUrl || ''}
                                            onChange={(e) => handleVariantDataChange(value, 'imageUrl', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
      )}

       <Card className="p-6">
          <Label className="text-base font-medium">Additional Details</Label>
          <p className="text-sm text-muted-foreground mb-4">Add non-variant details like brand, origin, etc.</p>
          <div className="space-y-4">
            {attributes.map((attr, index) => (
              <div key={attr.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor={`attr-key-${index}`} className="text-xs">Attribute Name</Label>
                  <Input 
                    id={`attr-key-${index}`}
                    placeholder="e.g. Brand" 
                    value={attr.key}
                    onChange={(e) => handleAttributeChange(attr.id, 'key', e.target.value)}
                  />
                </div>
                 <div className="flex-1">
                  <Label htmlFor={`attr-value-${index}`} className="text-xs">Value</Label>
                  <Input 
                    id={`attr-value-${index}`}
                    placeholder="e.g. FreshFarms"
                    value={attr.value}
                    onChange={(e) => handleAttributeChange(attr.id, 'value', e.target.value)}
                   />
                </div>
                <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveAttribute(attr.id)}>
                  <Trash2 className="h-4 w-4"/>
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={handleAddAttribute}>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Add Detail
          </Button>
      </Card>
      
      <Separator />
      
      {/* Footer */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (isEditing ? 'Updating Product...' : 'Adding Product...') : (isEditing ? 'Update Product' : 'Add Product')}
        </Button>
      </div>
    </form>
  );
}
