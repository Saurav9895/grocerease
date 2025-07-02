

"use client";

import { useCart } from "@/hooks/use-cart";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { AuthGuard } from "@/components/common/AuthGuard";
import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDeliverySettings, getPromoCodeByCode, hasUserUsedPromo } from "@/lib/data";
import type { DeliverySettings, PromoCode } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";

function CheckoutView() {
  const { cartItems, cartTotal, updateQuantity, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({ fee: 0, freeDeliveryThreshold: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [freeDeliveryAppliedByPromo, setFreeDeliveryAppliedByPromo] = useState(false);


  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace("/orders");
    }
  }, [cartItems, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const settings = await getDeliverySettings();
      setDeliverySettings(settings);
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be signed in to use a promo code." });
        return;
    }

    setIsApplyingPromo(true);

    const code = promoInput.toUpperCase();

    const alreadyUsed = await hasUserUsedPromo(user.uid, code);
    if (alreadyUsed) {
        toast({ variant: "destructive", title: "Promo Code Error", description: "You have already used this promo code." });
        setIsApplyingPromo(false);
        return;
    }

    const promo = await getPromoCodeByCode(code);
    if (promo) {
      setAppliedPromo(promo);
       if (promo.type === 'percentage' && promo.discountPercentage) {
        const discount = (cartTotal * promo.discountPercentage) / 100;
        setDiscountAmount(discount);
        setFreeDeliveryAppliedByPromo(false);
        toast({ title: "Success", description: `Discount of ${promo.discountPercentage}% applied!` });
      } else if (promo.type === 'free_delivery') {
        setDiscountAmount(0);
        setFreeDeliveryAppliedByPromo(true);
        toast({ title: "Success", description: `Promo code for free delivery applied!` });
      }
    } else {
      setAppliedPromo(null);
      setDiscountAmount(0);
      setFreeDeliveryAppliedByPromo(false);
      toast({ variant: "destructive", title: "Error", description: "Invalid or expired promo code." });
    }
    setIsApplyingPromo(false);
  }

  const handleRemovePromo = () => {
      setAppliedPromo(null);
      setDiscountAmount(0);
      setPromoInput("");
      setFreeDeliveryAppliedByPromo(false);
  }

  const threshold = deliverySettings.freeDeliveryThreshold;
  const freeDeliveryByThreshold = (threshold > 0 && cartTotal >= threshold) || (cartTotal === 0);
  
  // This is the fee that will be charged to the customer and saved in the order.
  const appliedDeliveryFee = freeDeliveryAppliedByPromo || freeDeliveryByThreshold ? 0 : deliverySettings.fee;
  
  // This is the total value of all discounts, for display purposes only.
  const displayableDiscountValue = discountAmount + (
    (freeDeliveryAppliedByPromo && !freeDeliveryByThreshold) ? deliverySettings.fee : 0
  );
    
  const finalTotal = cartTotal + appliedDeliveryFee - discountAmount;

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <CheckoutForm 
            deliveryFee={appliedDeliveryFee}
            discountAmount={discountAmount}
            promoCode={appliedPromo?.id}
            total={finalTotal}
          />
        </div>
        <div className="order-first lg:order-last">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Order Summary</CardTitle>
                <Button asChild variant="outline" size="sm">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                       <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product image"/>
                    </div>
                    <div>
                      <Link href={`/product/${item.productId || item.id}`} className="font-medium hover:underline">
                          {item.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                          <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                              <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm w-4 text-center tabular-nums">{item.quantity}</span>
                          <Button type="button" variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}>
                              <Plus className="h-3 w-3" />
                          </Button>
                      </div>
                    </div>
                  </div>
                  <p className="font-medium">Rs{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-muted-foreground"><p>Subtotal</p><p>Rs{cartTotal.toFixed(2)}</p></div>
              <div className="flex justify-between text-muted-foreground"><p>Delivery Fee</p>{isLoading ? <Skeleton className="h-5 w-12" /> : <p>Rs{appliedDeliveryFee.toFixed(2)}</p>}</div>
               {freeDeliveryByThreshold && !freeDeliveryAppliedByPromo && cartTotal > 0 && (
                <div className="flex justify-end"><Badge variant="secondary" className="bg-green-100 text-green-800">Free delivery applied!</Badge></div>
              )}
               {appliedPromo && displayableDiscountValue > 0 && (
                <div className="flex justify-between text-green-600">
                    <p>Discount ({appliedPromo.id})</p>
                    <p>-Rs{displayableDiscountValue.toFixed(2)}</p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg"><p>Total</p>{isLoading ? <Skeleton className="h-6 w-20" /> : <p>Rs{finalTotal.toFixed(2)}</p>}</div>
            </CardContent>
            <CardFooter className="flex-col gap-2 items-start bg-muted/50 p-4">
                <Label htmlFor="promo" className="text-sm font-medium">Have a promo code?</Label>
                <div className="flex w-full gap-2">
                    <Input id="promo" placeholder="Enter code" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} disabled={!!appliedPromo} />
                    <Button onClick={handleApplyPromo} disabled={isApplyingPromo || !!appliedPromo}>
                        {isApplyingPromo ? "Applying..." : "Apply"}
                    </Button>
                </div>
                {appliedPromo && (
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={handleRemovePromo}>Remove code</Button>
                )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}


export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutView />
    </AuthGuard>
  )
}
