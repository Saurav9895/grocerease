

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
  price: z.coerce.number().min(0, "Price must be a non-negative number."),
  originalPrice: z.coerce.number().optional(),
  category: z.string().min(1, "Please select a category."),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative number."),
  imageUrl: z.string().url("Please enter a valid image URL."),
});

type Attribute = {
  id: number;
  key: string;
  value: string;
};

type VariantRow = {
  id: number;
  value: string;
  price: string;
  originalPrice: string;
  stock: string;
  imageUrl: string;
};

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allAttributeSets, setAllAttributeSets] = useState<AttributeSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!product;
  const { toast } = useToast();
  
  // Base product state
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || 'https://placehold.co/600x400.png');
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  // Variant state
  const [isVariant, setIsVariant] = useState(false);
  const [variantAttributeName, setVariantAttributeName] = useState('');
  const [variants, setVariants] = useState<VariantRow[]>([]);


  useEffect(() => {
    const fetchInitialData = async () => {
      const [fetchedCategories, fetchedAttributes] = await Promise.all([
        getCategories(),
        getAttributes(),
      ]);
      setCategories(fetchedCategories);
      setAllAttributeSets(fetchedAttributes);
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (product) {
      setImageUrl(product.imageUrl);
      setAttributes(product.attributes ? Object.entries(product.attributes).map(([key, value], index) => ({ id: index, key, value })) : []);
      
      setIsVariant(product.isVariant || false);
      setVariantAttributeName(product.variantAttributeName || '');
      if(product.isVariant && product.variants){
         const variantsArray = Object.entries(product.variants).map(([value, data], index) => ({
            id: Date.now() + index,
            value,
            price: String(data.price),
            originalPrice: String(data.originalPrice || ''),
            stock: String(data.stock),
            imageUrl: data.imageUrl,
         }));
         setVariants(variantsArray);
      } else {
        setVariants([]);
      }

    } else {
      // Reset form for new product
      setImageUrl('https://placehold.co/600x400.png');
      setAttributes([]);
      setIsVariant(false);
      setVariantAttributeName('');
      setVariants([]);
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
  
  const handleAddVariant = () => {
    setVariants(prev => [...prev, {
        id: Date.now(),
        value: '',
        price: '',
        originalPrice: '',
        stock: '',
        imageUrl: 'https://placehold.co/600x400.png',
    }]);
  };

  const handleVariantChange = (id: number, field: keyof Omit<VariantRow, 'id'>, value: string) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleRemoveVariant = (id: number) => {
    setVariants(prev => prev.filter(v => v.id !== id));
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
        if (!variantAttributeName.trim()) {
            toast({ variant: 'destructive', title: 'Variant Error', description: 'Please select a variant attribute.' });
            setIsLoading(false);
            return;
        }

        const variantsToSave: Product['variants'] = {};
        for (const variant of variants) {
            if (!variant.value.trim() || !variant.price.trim() || !variant.stock.trim() || !variant.imageUrl.trim()) {
                toast({ variant: 'destructive', title: 'Variant Error', description: `Please fill all fields for all variants. One or more fields are empty.` });
                setIsLoading(false);
                return;
            }
            const price = parseFloat(variant.price);
            const originalPrice = variant.originalPrice ? parseFloat(variant.originalPrice) : undefined;
            const stock = parseInt(variant.stock, 10);

            if (isNaN(price) || (originalPrice !== undefined && isNaN(originalPrice)) || isNaN(stock)) {
                 toast({ variant: 'destructive', title: 'Variant Error', description: `Please enter valid numbers for price, original price, and stock for variant "${variant.value}".` });
                setIsLoading(false);
                return;
            }

            variantsToSave[variant.value.trim()] = {
                price,
                originalPrice,
                stock,
                imageUrl: variant.imageUrl.trim(),
            };
        }
        
        dataToSave = {
            ...dataToSave,
            variantAttributeName: variantAttributeName.trim(),
            variants: variantsToSave,
        };
    } else {
        dataToSave = {
            ...dataToSave,
            variantAttributeName: null,
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
                    <Label htmlFor="originalPrice">Original Price (M.R.P.)</Label>
                    <Input id="originalPrice" name="originalPrice" type="number" step="0.01" placeholder="e.g., 120.00" defaultValue={product?.originalPrice} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="price">{isVariant ? 'Base Sale Price' : 'Sale Price'}</Label>
                    <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required placeholder="e.g., 99.00" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="stock">{isVariant ? 'Base Stock' : 'Stock'}</Label>
                <Input id="stock" name="stock" type="number" defaultValue={product?.stock} required />
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
            <p className="text-sm text-muted-foreground mb-4">Define an attribute and add all its available options.</p>
            <Separator className="my-4" />
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="variant-attribute-name">Variant Attribute</Label>
                    <Select
                      value={variantAttributeName}
                      onValueChange={setVariantAttributeName}
                    >
                      <SelectTrigger id="variant-attribute-name">
                        <SelectValue placeholder="Select an attribute for variants" />
                      </SelectTrigger>
                      <SelectContent>
                        {allAttributeSets.map(attr => (
                          <SelectItem key={attr.id} value={attr.name}>
                            {attr.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                
                {variants.map((variant, index) => (
                    <div key={variant.id} className="p-4 border rounded-md space-y-4 relative">
                         <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 h-7 w-7" onClick={() => handleRemoveVariant(variant.id)}>
                            <Trash2 className="h-4 w-4"/>
                         </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`variant-value-${index}`}>Option Value</Label>
                                <Input id={`variant-value-${index}`} placeholder="e.g., 500gm, Large, Blue"
                                    value={variant.value}
                                    onChange={(e) => handleVariantChange(variant.id, 'value', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`variant-stock-${index}`}>Stock</Label>
                                <Input id={`variant-stock-${index}`} type="number" placeholder="Variant stock"
                                    value={variant.stock}
                                    onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)}
                                />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor={`variant-oprice-${index}`}>Original Price</Label>
                                <Input id={`variant-oprice-${index}`} type="number" step="0.01" placeholder="e.g. 120.00"
                                    value={variant.originalPrice}
                                    onChange={(e) => handleVariantChange(variant.id, 'originalPrice', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor={`variant-price-${index}`}>Sale Price</Label>
                                <Input id={`variant-price-${index}`} type="number" step="0.01" placeholder="e.g. 99.00"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)}
                                />
                            </div>
                        </div>
                         <div className="flex gap-4 items-start">
                            <div className="space-y-2 flex-1">
                                <Label htmlFor={`variant-image-${index}`}>Image URL</Label>
                                <Input id={`variant-image-${index}`} placeholder="Variant image URL"
                                    value={variant.imageUrl}
                                    onChange={(e) => handleVariantChange(variant.id, 'imageUrl', e.target.value)}
                                />
                            </div>
                            {isPreviewable(variant.imageUrl) && (
                                <div className="space-y-2">
                                    <Label>Preview</Label>
                                    <div className="relative h-20 w-20 rounded-md overflow-hidden border bg-muted">
                                         <Image
                                            src={variant.imageUrl}
                                            alt="Variant preview"
                                            fill
                                            className="object-cover"
                                            onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100.png')}
                                            data-ai-hint="product image"
                                        />
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                ))}

                <Button type="button" variant="outline" className="w-full" onClick={handleAddVariant}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Add another option
                </Button>
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
