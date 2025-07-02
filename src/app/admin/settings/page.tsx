

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getDeliverySettings, updateDeliverySettings, getPromoCodes, createPromoCode, deletePromoCode, getHomepageSettings, getProducts, updateHomepageSettings, getCategories } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { DeliverySettings, PromoCode, Product, Category } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, ChevronsUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const settingsSchema = z.object({
  fee: z.coerce.number().min(0, "Delivery fee must be a positive number."),
  freeDeliveryThreshold: z.coerce.number().min(0, "Threshold must be a positive number."),
});

const promoCodeSchema = z.object({
    code: z.string().min(3, "Code must be at least 3 characters.").toUpperCase(),
    type: z.enum(['percentage', 'free_delivery'], { required_error: "Please select a promo type."}),
    discountPercentage: z.coerce.number().optional(),
}).refine(data => {
    if (data.type === 'percentage') {
        return data.discountPercentage && data.discountPercentage >= 1 && data.discountPercentage <= 100;
    }
    return true;
}, {
    message: "Discount must be 1-100% for percentage codes.",
    path: ["discountPercentage"],
});


export default function AdminSettingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  // Promo codes state
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoadingPromo, setIsLoadingPromo] = useState(true);
  
  // Homepage settings state
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [featuredProductIds, setFeaturedProductIds] = useState<string[]>([]);
  const [featuredCategoryIds, setFeaturedCategoryIds] = useState<string[]>([]);
  const [isLoadingHomepage, setIsLoadingHomepage] = useState(true);
  const [isProductPopoverOpen, setIsProductPopoverOpen] = useState(false);
  const [isCategoryPopoverOpen, setIsCategoryPopoverOpen] = useState(false);


  const deliveryForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { fee: 0, freeDeliveryThreshold: 0 },
  });

  const promoForm = useForm<z.infer<typeof promoCodeSchema>>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: { code: "", type: "percentage", discountPercentage: 10 },
  });
  
  const promoType = promoForm.watch("type");

  const fetchAllSettings = async () => {
    setIsLoading(true);
    setIsLoadingPromo(true);
    setIsLoadingHomepage(true);

    const [delivery, promos, homepage, products, categories] = await Promise.all([
      getDeliverySettings(),
      getPromoCodes(),
      getHomepageSettings(),
      getProducts(),
      getCategories(),
    ]);

    deliveryForm.reset({ fee: delivery.fee, freeDeliveryThreshold: delivery.freeDeliveryThreshold });
    setPromoCodes(promos);
    setAllProducts(products);
    setAllCategories(categories);
    setFeaturedProductIds(homepage.featuredProductIds);
    setFeaturedCategoryIds(homepage.featuredCategoryIds || []);
    
    setIsLoading(false);
    setIsLoadingPromo(false);
    setIsLoadingHomepage(false);
  };

  useEffect(() => {
    if (profile?.adminRole === 'main') {
      fetchAllSettings();
    }
  }, [profile]);

  const onDeliverySubmit = async (values: z.infer<typeof settingsSchema>) => {
    try {
      await updateDeliverySettings(values);
      toast({ title: "Settings Updated", description: "Delivery settings have been successfully updated." });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update the settings." });
    }
  };

  const onPromoSubmit = async (values: z.infer<typeof promoCodeSchema>) => {
    try {
        await createPromoCode({ 
            id: values.code, 
            type: values.type, 
            discountPercentage: values.discountPercentage 
        });
        toast({ title: "Promo Code Created", description: `Code "${values.code}" has been created.` });
        promoForm.reset({ code: "", type: "percentage", discountPercentage: 10 });
        const codes = await getPromoCodes();
        setPromoCodes(codes);
    } catch (error) {
        console.error("Error creating promo code:", error);
        toast({ variant: "destructive", title: "Creation Failed", description: "Could not create the promo code. It might already exist." });
    }
  }

  const handleDeletePromo = async (codeId: string) => {
    try {
        await deletePromoCode(codeId);
        toast({ title: "Promo Code Deleted" });
        const codes = await getPromoCodes();
        setPromoCodes(codes);
    } catch (error) {
        console.error("Error deleting promo code:", error);
        toast({ variant: "destructive", title: "Deletion Failed" });
    }
  }

  const handleHomepageUpdate = async () => {
    try {
      await updateHomepageSettings({ featuredProductIds, featuredCategoryIds });
      toast({ title: "Homepage settings updated successfully!" });
    } catch (error) {
       console.error("Error updating homepage settings:", error);
       toast({ variant: "destructive", title: "Update Failed", description: "Could not update homepage settings." });
    }
  };
  
  const featuredProductsDetails = featuredProductIds
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));
    
  const featuredCategoriesDetails = featuredCategoryIds
    .map(id => allCategories.find(c => c.id === id))
    .filter((c): c is Category => Boolean(c));

  const handleMoveProduct = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...featuredProductIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setFeaturedProductIds(newOrder);
  };

  const handleRemoveFeaturedProduct = (id: string) => {
    setFeaturedProductIds(featuredProductIds.filter(pid => pid !== id));
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...featuredCategoryIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setFeaturedCategoryIds(newOrder);
  };

  const handleRemoveFeaturedCategory = (id: string) => {
    setFeaturedCategoryIds(featuredCategoryIds.filter(cid => cid !== id));
  };
  
  if (profile?.adminRole !== 'main') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md text-center p-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="text-destructive" /> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to view or manage store settings.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please contact the main administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Store Settings</h1>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Settings</CardTitle>
              <CardDescription>Manage delivery fees and promotions for your store.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" /> <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-20" />
                </div>
              ) : (
                <Form {...deliveryForm}>
                  <form onSubmit={deliveryForm.handleSubmit(onDeliverySubmit)} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <FormField control={deliveryForm.control} name="fee" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Standard Delivery Fee (Rs)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={deliveryForm.control} name="freeDeliveryThreshold" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Free Delivery Threshold (Rs)</FormLabel>
                          <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                          <FormDescription>Minimum order total for free delivery. Set to 0 to disable.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" disabled={deliveryForm.formState.isSubmitting}>
                      {deliveryForm.formState.isSubmitting ? "Saving..." : "Save Delivery Settings"}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>Homepage Settings</CardTitle>
              <CardDescription>Control content displayed on your storefront homepage.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHomepage ? <Skeleton className="h-48 w-full" /> : (
                <div className="space-y-6">
                  {/* Featured Products */}
                  <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <Label className="font-medium">Featured Products</Label>
                      <p className="text-sm text-muted-foreground">Select up to 4 products to feature prominently.</p>
                    </div>
                    <Popover open={isProductPopoverOpen} onOpenChange={setIsProductPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={isProductPopoverOpen} className="w-full justify-between">
                          Add a product...
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search products..." />
                          <CommandList>
                            <CommandEmpty>No products found.</CommandEmpty>
                            <CommandGroup>
                              {allProducts.map((product) => (
                                <CommandItem key={product.id} value={product.name} disabled={featuredProductIds.includes(product.id)} onSelect={() => {
                                  if (featuredProductIds.length >= 4) {
                                    toast({ variant: "destructive", title: "Limit reached", description: "You can only select up to 4 featured products." });
                                    setIsProductPopoverOpen(false); return;
                                  }
                                  setFeaturedProductIds([...featuredProductIds, product.id]);
                                }}>{product.name}</CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="space-y-2">
                      <Label>Selected Products (Order represents display order)</Label>
                      {featuredProductsDetails.length > 0 ? (
                        <div className="space-y-2 rounded-md border p-2">
                          {featuredProductsDetails.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                              <div className="flex items-center gap-3 font-medium">
                                  <span className="text-muted-foreground">#{index + 1}</span>
                                  <Image src={product.imageUrl} alt={product.name} width={24} height={24} className="rounded-sm object-cover" />
                                  <span className="truncate">{product.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMoveProduct(index, 'up')} disabled={index === 0}> <ArrowUp className="h-4 w-4" /> </Button>
                                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMoveProduct(index, 'down')} disabled={index === featuredProductsDetails.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemoveFeaturedProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <div className="text-sm text-center text-muted-foreground py-4 border border-dashed rounded-md">No products selected.</div>}
                    </div>
                  </div>

                  {/* Featured Categories */}
                   <div className="space-y-4 p-4 border rounded-md">
                    <div>
                      <Label className="font-medium">Featured Categories</Label>
                      <p className="text-sm text-muted-foreground">Select up to 5 categories for the homepage grid.</p>
                    </div>
                    <Popover open={isCategoryPopoverOpen} onOpenChange={setIsCategoryPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" aria-expanded={isCategoryPopoverOpen} className="w-full justify-between">
                          Add a category...
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Search categories..." />
                          <CommandList>
                            <CommandEmpty>No categories found.</CommandEmpty>
                            <CommandGroup>
                              {allCategories.map((category) => (
                                <CommandItem key={category.id} value={category.name} disabled={featuredCategoryIds.includes(category.id)} onSelect={() => {
                                  if (featuredCategoryIds.length >= 5) {
                                    toast({ variant: "destructive", title: "Limit reached", description: "You can only select up to 5 featured categories." });
                                    setIsCategoryPopoverOpen(false); return;
                                  }
                                  setFeaturedCategoryIds([...featuredCategoryIds, category.id]);
                                }}>{category.name}</CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="space-y-2">
                      <Label>Selected Categories (Order represents display order)</Label>
                      {featuredCategoriesDetails.length > 0 ? (
                        <div className="space-y-2 rounded-md border p-2">
                          {featuredCategoriesDetails.map((category, index) => (
                            <div key={category.id} className="flex items-center justify-between rounded-md bg-muted/50 p-2">
                              <div className="flex items-center gap-3 font-medium">
                                  <span className="text-muted-foreground">#{index + 1}</span>
                                  <Image src={category.imageUrl} alt={category.name} width={24} height={24} className="rounded-sm object-cover" />
                                  <span className="truncate">{category.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMoveCategory(index, 'up')} disabled={index === 0}> <ArrowUp className="h-4 w-4" /> </Button>
                                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleMoveCategory(index, 'down')} disabled={index === featuredCategoriesDetails.length - 1}><ArrowDown className="h-4 w-4" /></Button>
                                  <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleRemoveFeaturedCategory(category.id)}><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <div className="text-sm text-center text-muted-foreground py-4 border border-dashed rounded-md">No categories selected.</div>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleHomepageUpdate} disabled={isLoadingHomepage}>Save Homepage Settings</Button>
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Promo Codes</CardTitle>
                    <CardDescription>Create and manage discount codes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...promoForm}>
                        <form onSubmit={promoForm.handleSubmit(onPromoSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                            <FormField control={promoForm.control} name="code" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Code</FormLabel>
                                    <FormControl><Input placeholder="SUMMER20" {...field} /></FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )} />
                             <FormField control={promoForm.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="free_delivery">Free Delivery</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage/>
                                </FormItem>
                            )} />
                            {promoType === 'percentage' && (
                                <FormField control={promoForm.control} name="discountPercentage" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount (%)</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )} />
                            )}
                            <Button type="submit" disabled={promoForm.formState.isSubmitting} className="sm:col-start-2">Add</Button>
                        </form>
                    </Form>
                    <Separator className="my-6"/>
                    <h3 className="text-sm font-medium mb-2">Active Codes</h3>
                    {isLoadingPromo ? <Skeleton className="h-20 w-full"/> : (
                        <div className="space-y-2">
                            {promoCodes.length > 0 ? promoCodes.map(pc => (
                                <div key={pc.id} className="flex items-center justify-between p-2 border rounded-md">
                                    <Badge variant="outline" className="text-base">{pc.id}</Badge>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">
                                            {pc.type === 'percentage' ? `${pc.discountPercentage}% OFF` : 'Free Delivery'}
                                        </span>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Delete "{pc.id}"?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeletePromo(pc.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-muted-foreground text-center py-4">No promo codes created yet.</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
