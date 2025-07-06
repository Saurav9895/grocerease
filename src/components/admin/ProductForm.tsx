

"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategories, getAttributes, createCategory } from "@/lib/data";
import type { Product, Category, AttributeSet } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { z } from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import Image from "next/image";
import { PlusCircle, Trash2, Wand2 } from "lucide-react";
import { Separator } from "../ui/separator";
import { Checkbox } from "../ui/checkbox";
import { useAuth } from "@/context/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

type ProductAttribute = {
  id: number;
  key: string;
  value: string;
  isVariant: boolean;
};

type VariantSKU = {
    id: string; // e.g. "black-s"
    options: Record<string, string>;
    price: string;
    originalPrice: string;
    stock: string;
    imageUrl: string;
};

// Helper function to calculate cartesian product for variants
const cartesian = <T>(...a: T[][]): T[][] => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())), [[]] as T[][]);

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allAttributeSets, setAllAttributeSets] = useState<AttributeSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!product;
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || 'https://placehold.co/600x400.png');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // New unified state for all attributes
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);

  // Variant state
  const [hasVariants, setHasVariants] = useState(false);
  const [variantSKUs, setVariantSKUs] = useState<VariantSKU[]>([]);

  // Category creation state
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);


  useEffect(() => {
    const fetchInitialData = async () => {
      const fetchOptions: { vendorId?: string } = {};
      if (profile?.adminRole === 'vendor' && profile.vendorId) {
          fetchOptions.vendorId = profile.vendorId;
      }
      
      const [fetchedCategories, fetchedAttributes] = await Promise.all([
        getCategories(fetchOptions),
        getAttributes(fetchOptions),
      ]);
      setCategories(fetchedCategories);
      setAllAttributeSets(fetchedAttributes);
    };
    if (profile) {
      fetchInitialData();
    }
  }, [profile]);

  useEffect(() => {
    if (product) {
      setImageUrl(product.imageUrl);
      setSelectedCategory(product.category);
      setHasVariants(product.hasVariants || false);
      
      const initialAttributes = product.attributes ? Object.entries(product.attributes).map(([key, value], i) => ({ id: Date.now() + i, key, value, isVariant: false })) : [];
      const initialVariantAttrs = product.variantDefinitions ? product.variantDefinitions.map((def, i) => ({ id: Date.now() + 1000 + i, key: def.name, value: def.values.join(', '), isVariant: true })) : [];
      setProductAttributes([...initialAttributes, ...initialVariantAttrs]);

      setVariantSKUs(product.variantSKUs?.map(sku => ({
        ...sku,
        price: String(sku.price),
        originalPrice: String(sku.originalPrice || ''),
        stock: String(sku.stock),
      })) || []);

    } else {
      // Reset form for new product
      setImageUrl('https://placehold.co/600x400.png');
      setSelectedCategory('');
      setHasVariants(false);
      setProductAttributes([]);
      setVariantSKUs([]);
    }
  }, [product]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({ variant: 'destructive', title: 'Category name cannot be empty.' });
      return;
    }
    setIsCreatingCategory(true);
    try {
      const vendorId = profile?.adminRole === 'vendor' ? profile.vendorId : null;
      const newCategoryId = await createCategory({ name: newCategoryName }, vendorId);
      toast({ title: 'Category Created', description: `"${newCategoryName}" has been successfully created.` });
      
      const fetchOptions: { vendorId?: string } = {};
      if (profile?.adminRole === 'vendor' && profile.vendorId) {
          fetchOptions.vendorId = profile.vendorId;
      }
      const freshCategories = await getCategories(fetchOptions);
      setCategories(freshCategories);
      setSelectedCategory(newCategoryId);

      setNewCategoryName('');
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
      toast({ variant: 'destructive', title: 'Creation Failed', description: 'Could not create the new category.' });
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleAddAttribute = () => setProductAttributes(prev => [...prev, { id: Date.now(), key: '', value: '', isVariant: hasVariants }]);
  const handleRemoveAttribute = (id: number) => setProductAttributes(prev => prev.filter(attr => attr.id !== id));
  const handleAttributeChange = (id: number, field: 'key' | 'value' | 'isVariant', value: string | boolean) => {
    setProductAttributes(prev => prev.map(attr => attr.id === id ? { ...attr, [field]: value } : attr));
  };
  
  const handleGenerateSKUs = () => {
    const variantAttrs = productAttributes.filter(attr => attr.isVariant && attr.key && attr.value);
    if (variantAttrs.length === 0) {
        toast({ variant: 'destructive', title: "No Variant Attributes", description: "Please mark at least one attribute as a variant and provide options."});
        return;
    }
    const optionsArrays = variantAttrs.map(attr => attr.value.split(',').map(v => v.trim()).filter(Boolean));
    if (optionsArrays.some(arr => arr.length === 0)) {
        toast({ variant: 'destructive', title: "Empty Options", description: "Please ensure all variant attributes have comma-separated options."});
        return;
    }

    const combinations = cartesian(...optionsArrays);
    
    const newSKUs = combinations.map(combo => {
        const options: Record<string, string> = {};
        variantAttrs.forEach((def, i) => {
            options[def.key] = combo[i];
        });
        const id = Object.values(options).join('-').toLowerCase().replace(/\s+/g, '-');
        
        const existingSKU = variantSKUs.find(sku => sku.id === id);

        return {
            id,
            options,
            price: existingSKU?.price || '',
            originalPrice: existingSKU?.originalPrice || '',
            stock: existingSKU?.stock || '',
            imageUrl: existingSKU?.imageUrl || 'https://placehold.co/100x100.png',
        };
    });
    setVariantSKUs(newSKUs);
  };

  const handleSKUChange = (id: string, field: keyof Omit<VariantSKU, 'id' | 'options'>, value: string) => {
    setVariantSKUs(prev => prev.map(sku => sku.id === id ? { ...sku, [field]: value } : sku));
  };

  const handleRemoveSKU = (id: string) => {
    setVariantSKUs(prev => prev.filter(sku => sku.id !== id));
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const rawFormData = Object.fromEntries(formData.entries());

    const validatedFields = productSchema.safeParse(rawFormData);
    
    if (!validatedFields.success) {
      const errorMessages = Object.values(validatedFields.error.flatten().fieldErrors).flat().join('\n');
      toast({ variant: "destructive", title: "Invalid data", description: errorMessages || "Please check the form fields." });
      setIsLoading(false);
      return;
    }
    
    const nonVariantAttributes = productAttributes
      .filter(a => !a.isVariant && a.key.trim())
      .reduce((acc, a) => ({ ...acc, [a.key.trim()]: a.value.trim() }), {});
    
    try {
      // Start with the validated data
      const { originalPrice, ...restData } = validatedFields.data;
      let dataToSave: any = { 
          ...restData, 
          attributes: nonVariantAttributes,
          hasVariants: hasVariants,
      };

      // Clean up base originalPrice
      if (originalPrice !== undefined && !isNaN(originalPrice)) {
          dataToSave.originalPrice = originalPrice;
      }

      if (hasVariants) {
          const finalVariantDefinitions = productAttributes
              .filter(a => a.isVariant && a.key && a.value)
              .map(a => ({ name: a.key, values: a.value.split(',').map(v => v.trim()).filter(Boolean) }));

          if (finalVariantDefinitions.length === 0) {
              throw new Error('Please define at least one variant attribute with options.');
          }

          const finalVariantSKUs = variantSKUs.map(sku => {
              const price = parseFloat(sku.price);
              const stock = parseInt(sku.stock, 10);
              
              if (isNaN(price) || isNaN(stock) || !sku.imageUrl.trim()) {
                  throw new Error(`Please fill all required fields (Price, Stock, Image URL) for SKU: ${Object.values(sku.options).join(' / ')}`);
              }

              let parsedOriginalPrice: number | undefined = undefined;
              if (sku.originalPrice && sku.originalPrice.trim() !== '') {
                  const num = parseFloat(sku.originalPrice);
                  if (isNaN(num)) {
                      throw new Error(`Invalid Original Price for SKU: ${Object.values(sku.options).join(' / ')}. Please enter a valid number or leave it empty.`);
                  }
                  parsedOriginalPrice = num;
              }

              return {
                  id: sku.id,
                  options: sku.options,
                  price: price,
                  originalPrice: parsedOriginalPrice,
                  stock: stock,
                  imageUrl: sku.imageUrl,
              };
          });

          if (finalVariantSKUs.length === 0) {
              throw new Error('Please generate variants and fill in their details.');
          }
          
          const totalStock = finalVariantSKUs.reduce((sum, sku) => sum + sku.stock, 0);

          // Update dataToSave with variant info
          dataToSave.variantDefinitions = finalVariantDefinitions;
          dataToSave.variantSKUs = finalVariantSKUs;
          dataToSave.price = finalVariantSKUs[0]?.price || 0;
          dataToSave.originalPrice = finalVariantSKUs[0]?.originalPrice;
          dataToSave.stock = totalStock;
          dataToSave.imageUrl = finalVariantSKUs[0]?.imageUrl || validatedFields.data.imageUrl;

      } else {
          dataToSave.variantDefinitions = [];
          dataToSave.variantSKUs = [];
      }

      if (isEditing && product) {
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, dataToSave);
      } else {
        if (profile?.adminRole !== 'vendor' || !profile.vendorId) {
            throw new Error('Only vendors can create new products.');
        }
        const vendorSnap = await getDoc(doc(db, 'vendors', profile.vendorId));
        if (!vendorSnap.exists()) {
             throw new Error('Vendor Not Found');
        }
        await addDoc(collection(db, "products"), { ...dataToSave, vendorId: profile.vendorId, vendorName: vendorSnap.data().name, rating: 0, reviewCount: 0, createdAt: serverTimestamp() });
      }
      toast({ title: `Product ${isEditing ? 'updated' : 'added'}` });
      onSuccess();
    } catch (error: any) {
      console.error("Error saving product:", error);
      toast({ variant: "destructive", title: "Failed to save product", description: error.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  const isPreviewable = (url: string) => {
    try { new URL(url); return true; } catch { return false; }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 grid gap-6">
          <Card className="p-6">
            <div className="space-y-2"><Label htmlFor="name">Product Name</Label><Input id="name" name="name" defaultValue={product?.name} required /></div>
            <div className="space-y-2 mt-4"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={product?.description} required rows={5} /></div>
          </Card>
          <Card className="p-6">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="originalPrice">Original Price (M.R.P.)</Label><Input id="originalPrice" name="originalPrice" type="number" step="0.01" placeholder="e.g., 120.00" defaultValue={product?.originalPrice} disabled={hasVariants} /></div>
                <div className="space-y-2"><Label htmlFor="price">{hasVariants ? 'Base Price' : 'Sale Price'}</Label><Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required placeholder="e.g., 99.00" disabled={hasVariants}/></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="space-y-2"><Label htmlFor="stock">{hasVariants ? 'Total Stock' : 'Stock'}</Label><Input id="stock" name="stock" type="number" defaultValue={product?.stock} required disabled={hasVariants} /></div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div className="flex items-center gap-2">
                    <Select name="category" value={selectedCategory} onValueChange={setSelectedCategory} required><SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger><SelectContent>{categories.map(cat => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select>
                     <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}><DialogTrigger asChild><Button type="button" variant="outline" size="icon" className="shrink-0"><PlusCircle className="h-4 w-4"/></Button></DialogTrigger><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Create New Category</DialogTitle></DialogHeader><div className="space-y-2 py-4"><Label htmlFor="new-category-name">Category Name</Label><Input id="new-category-name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="e.g., Organic Snacks"/></div><Button type="button" onClick={handleCreateCategory} disabled={isCreatingCategory}>{isCreatingCategory ? "Creating..." : "Create Category"}</Button></DialogContent></Dialog>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-2"><Label htmlFor="imageUrl">{hasVariants ? 'Base Image URL' : 'Image URL'}</Label><Input id="imageUrl" name="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required /></div>
              {isPreviewable(imageUrl) && (<div className="space-y-2 mt-4"><Label>Image Preview</Label><div className="relative aspect-square w-full rounded-md overflow-hidden border bg-muted"><Image src={imageUrl} alt="Product preview" fill className="object-cover" onError={() => setImageUrl('https://placehold.co/600x400.png')} data-ai-hint="product image" /></div></div>)}
            </Card>
        </div>
      </div>
      
       <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4"><Checkbox id="hasVariants" checked={hasVariants} onCheckedChange={(checked) => setHasVariants(!!checked)} /><Label htmlFor="hasVariants" className="text-base font-medium">This product has variants</Label></div>
          <Label className="text-base font-medium">Attributes & Variants</Label>
          <p className="text-sm text-muted-foreground mb-4">Add product details. For variants, check "Is Variant" and provide comma-separated options.</p>
          <div className="space-y-4">
              {productAttributes.map((attr, index) => (
                <div key={attr.id} className="grid grid-cols-1 md:grid-cols-[2fr_3fr_auto_auto] items-end gap-2 p-2 border rounded-md">
                    <div className="space-y-1">
                        <Label htmlFor={`attr-key-${index}`} className="text-xs">Attribute</Label>
                        <Select value={attr.key} onValueChange={(key) => handleAttributeChange(attr.id, 'key', key)}>
                          <SelectTrigger id={`attr-key-${index}`}><SelectValue placeholder="Select..." /></SelectTrigger>
                          <SelectContent>{allAttributeSets.map(attrSet => (<SelectItem key={attrSet.id} value={attrSet.name}>{attrSet.name}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor={`attr-value-${index}`} className="text-xs">Value(s)</Label>
                        <Input id={`attr-value-${index}`} placeholder={attr.isVariant ? "e.g. Small, Medium, Large" : "e.g. Cotton"} value={attr.value} onChange={(e) => handleAttributeChange(attr.id, 'value', e.target.value)}/>
                    </div>
                    {hasVariants && (
                        <div className="flex items-center space-x-2 pb-2">
                           <Checkbox id={`isVariant-${index}`} checked={attr.isVariant} onCheckedChange={(checked) => handleAttributeChange(attr.id, 'isVariant', !!checked)} />
                           <Label htmlFor={`isVariant-${index}`} className="text-xs">Is Variant?</Label>
                        </div>
                    )}
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveAttribute(attr.id)}><Trash2 className="h-4 w-4"/></Button>
                </div>
              ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={handleAddAttribute}><PlusCircle className="mr-2 h-4 w-4"/>Add Attribute</Button>
      </Card>
      
      {hasVariants && (
        <Card className="p-6 space-y-4">
            <h3 className="text-lg font-medium">Variant SKUs</h3>
            <p className="text-sm text-muted-foreground">Generate SKUs from your variant attributes, then set the price, stock, and image for each combination.</p>
            <Button type="button" className="w-full" onClick={handleGenerateSKUs}><Wand2 className="mr-2 h-4 w-4"/>Generate/Update Variant SKUs</Button>
            
            {variantSKUs.length > 0 && (
                 <div className="space-y-2 pt-4">
                    <h4 className="font-medium">Generated SKUs</h4>
                    <div className="border rounded-md overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Variant</TableHead>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Original Price</TableHead>
                                    <TableHead>Sale Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Image URL</TableHead>
                                    <TableHead className="w-[50px] text-right"><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {variantSKUs.map(sku => (
                                    <TableRow key={sku.id}>
                                        <TableCell className="font-medium whitespace-nowrap">{Object.values(sku.options).join(' / ')}</TableCell>
                                        <TableCell>
                                            <div className="relative h-10 w-10 rounded-md overflow-hidden border bg-muted">
                                                {isPreviewable(sku.imageUrl) && (
                                                    <Image src={sku.imageUrl} alt="SKU preview" fill className="object-cover" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                className="h-8 min-w-[100px]" 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="120.00" 
                                                value={sku.originalPrice} 
                                                onChange={e => handleSKUChange(sku.id, 'originalPrice', e.target.value)} 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                className="h-8 min-w-[100px]" 
                                                type="number" 
                                                step="0.01" 
                                                placeholder="99.00" 
                                                value={sku.price} 
                                                onChange={e => handleSKUChange(sku.id, 'price', e.target.value)} 
                                                required 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                className="h-8 min-w-[80px]" 
                                                type="number" 
                                                placeholder="10" 
                                                value={sku.stock} 
                                                onChange={e => handleSKUChange(sku.id, 'stock', e.target.value)} 
                                                required 
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                className="h-8 min-w-[200px]" 
                                                placeholder="https://..." 
                                                value={sku.imageUrl} 
                                                onChange={e => handleSKUChange(sku.id, 'imageUrl', e.target.value)} 
                                                required 
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveSKU(sku.id)}>
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Delete SKU</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </Card>
      )}
      
      <Separator />
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>{isLoading ? (isEditing ? 'Updating Product...' : 'Adding Product...') : (isEditing ? 'Update Product' : 'Add Product')}</Button>
      </div>
    </form>
  );
}
