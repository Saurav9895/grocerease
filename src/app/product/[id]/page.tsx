
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProductById, getCategories, getProductsByCategory, getReviewsForProduct } from '@/lib/data';
import type { Product, Category, Review } from '@/lib/types';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ShoppingCart, Star, StarHalf, Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/shop/ProductCard';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthProvider';
import { ReviewList } from '@/components/shop/ReviewList';
import { ReviewForm } from '@/components/shop/ReviewForm';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';


const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 fill-current" />
        ))}
        {hasHalfStar && <StarHalf className="h-5 w-5 fill-current" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-muted-foreground/50 fill-muted-foreground/20" />
        ))}
      </div>
    );
  };

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  const fetchData = async (productId: string) => {
    setIsLoading(true);
    setIsLoadingRelated(true);
    setIsLoadingReviews(true);

    const [fetchedProduct, fetchedCategories, fetchedReviews] = await Promise.all([
        getProductById(productId),
        getCategories(),
        getReviewsForProduct(productId)
    ]);

    setProduct(fetchedProduct);
    setCategories(fetchedCategories);
    setReviews(fetchedReviews);
    setIsLoading(false);
    setIsLoadingReviews(false);

    if (fetchedProduct) {
        if (fetchedProduct.isVariant && fetchedProduct.variants) {
          const firstVariantKey = Object.keys(fetchedProduct.variants)[0];
          setSelectedVariant(firstVariantKey || null);
        }

        const related = await getProductsByCategory(fetchedProduct.category);
        setRelatedProducts(related.filter(p => p.id !== fetchedProduct.id).slice(0, 4));
    }
    setIsLoadingRelated(false);
  };
  
  useEffect(() => {
    if (typeof id === 'string') {
      fetchData(id);
    }
  }, [id]);

  const handleReviewSubmitted = () => {
    // Refetch reviews and product data to show the new review and updated average rating
    if (typeof id === 'string') {
      fetchData(id);
    }
  }

  const handleAddToCart = () => {
    if (product) {
      if (product.isVariant) {
        if (!selectedVariant || !product.variants?.[selectedVariant]) {
          toast({ variant: "destructive", title: "Please select an option" });
          return;
        }
        const variantData = product.variants[selectedVariant];
        const variantCartItem = {
          ...product,
          id: `${product.id}-${selectedVariant}`, // Unique ID for cart
          name: `${product.name} (${selectedVariant})`,
          price: variantData.price,
          stock: variantData.stock,
          imageUrl: variantData.imageUrl,
          isVariant: false, // Treat as a simple product in cart
          variants: {},
          attributes: product.attributes
        };
        addToCart({ ...variantCartItem, quantity });
        toast({
            title: "Added to cart",
            description: `${quantity} x ${variantCartItem.name} has been added to your cart.`,
        });
      } else {
        addToCart({ ...product, quantity: quantity });
        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.name} has been added to your cart.`,
        });
      }
    }
  };
  
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  }
  
  const displayableProduct = (() => {
    if (!product) return null;
    if (product.isVariant && selectedVariant && product.variants?.[selectedVariant]) {
      const variant = product.variants[selectedVariant];
      return {
        price: variant.price,
        imageUrl: variant.imageUrl,
        stock: variant.stock,
      };
    }
    return {
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    };
  })();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <Skeleton className="w-full aspect-square rounded-lg" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2 mt-2" />
            <Skeleton className="h-8 w-1/3 mt-4" />
            <div className="pt-6 space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container text-center py-24">
        <h1 className="text-4xl font-bold">Product Not Found</h1>
        <p className="text-muted-foreground mt-4">Sorry, we couldn't find the product you're looking for.</p>
        <Button onClick={() => router.push('/')} className="mt-8">Go Back Home</Button>
      </div>
    );
  }

  const isAddToCartDisabled = (product.isVariant && !selectedVariant) || displayableProduct?.stock === 0;

  return (
    <div className="container py-12">
      <Button variant="outline" onClick={() => router.back()} className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="relative aspect-square rounded-lg overflow-hidden border bg-card">
          {displayableProduct && (
            <Image
              src={displayableProduct.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint="product image"
              key={displayableProduct.imageUrl} // force re-render on image change
            />
          )}
        </div>
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">{getCategoryName(product.category)}</Badge>
            <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
          </div>
          <div className="flex items-center gap-2 cursor-pointer" title={`${product.rating.toFixed(1)} out of 5 stars`}>
            {renderStars(product.rating)}
            <span className="text-muted-foreground text-sm hover:underline">({product.reviewCount} reviews)</span>
          </div>
          {displayableProduct && <p className="text-3xl font-semibold text-primary">Rs{displayableProduct.price.toFixed(2)}</p>}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
          
          {product.isVariant && product.variants && (
             <div className="space-y-4">
                <Label className="text-lg font-semibold">Options</Label>
                <RadioGroup value={selectedVariant || ''} onValueChange={setSelectedVariant} className="flex flex-wrap gap-2">
                    {Object.keys(product.variants).map((value) => (
                        <RadioGroupItem key={value} value={value} id={`variant-${value}`} className="sr-only" />
                    ))}
                    {Object.keys(product.variants).map((value) => (
                         <Label
                            key={value}
                            htmlFor={`variant-${value}`}
                            className={cn(
                                "cursor-pointer rounded-md border-2 border-muted bg-popover px-4 py-2 hover:bg-accent hover:text-accent-foreground",
                                selectedVariant === value && "border-primary"
                            )}
                        >
                            {value}
                        </Label>
                    ))}
                </RadioGroup>
            </div>
          )}

          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="space-y-4 pt-2">
                <h2 className="text-lg font-semibold">Details</h2>
                <div className="rounded-md border bg-muted/50">
                    <ul className="divide-y divide-border">
                        {Object.entries(product.attributes).map(([key, value]) => (
                            <li key={key} className="flex justify-between items-center p-3">
                                <span className="text-muted-foreground">{key}</span>
                                <span className="font-medium text-right">{value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
                <Label htmlFor="quantity" className="text-lg font-semibold shrink-0">Quantity</Label>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || displayableProduct?.stock === 0}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            const stock = displayableProduct?.stock ?? 0;
                            if (!isNaN(value) && value > 0 && value <= stock) {
                                setQuantity(value);
                            } else if (e.target.value === '') {
                                setQuantity(1);
                            }
                        }}
                        className="h-9 w-14 text-center"
                        min="1"
                        max={displayableProduct?.stock}
                        disabled={displayableProduct?.stock === 0}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setQuantity(Math.min(displayableProduct?.stock ?? 0, quantity + 1))}
                        disabled={quantity >= (displayableProduct?.stock ?? 0) || displayableProduct?.stock === 0}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {displayableProduct && displayableProduct.stock > 0 ? (
                <p className="text-sm text-muted-foreground">{displayableProduct.stock} in stock</p>
            ) : (
                <p className="text-sm text-destructive font-medium">Out of stock</p>
            )}
          </div>
          <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={isAddToCartDisabled}>
             <ShoppingCart className="mr-2 h-5 w-5" />
            {displayableProduct?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      <Separator className="my-16" />

      <div id="reviews" className="space-y-8">
        <h2 className="text-3xl font-bold">Ratings & Reviews</h2>
        {user && (
            <div className="p-8 bg-card border rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
                <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
            </div>
        )}
        {isLoadingReviews ? (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        ) : (
            <ReviewList reviews={reviews} />
        )}
      </div>
      
      {relatedProducts.length > 0 && (
        <>
            <Separator className="my-16" />
            <div className="space-y-8">
                <h2 className="text-3xl font-bold">You May Also Like</h2>
                {isLoadingRelated ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-full" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map(p => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </>
      )}

    </div>
  );
}
