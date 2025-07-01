
"use client";

import { useCart } from "@/hooks/use-cart";
import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
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

function CheckoutView() {
  const { cartItems, cartTotal } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({ fee: 0, freeDeliveryThreshold: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

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
      const discount = (cartTotal * promo.discountPercentage) / 100;
      setDiscountAmount(discount);
      toast({ title: "Success", description: `Promo code "${promo.id}" applied!` });
    } else {
      setAppliedPromo(null);
      setDiscountAmount(0);
      toast({ variant: "destructive", title: "Error", description: "Invalid or expired promo code." });
    }
    setIsApplyingPromo(false);
  }

  const threshold = deliverySettings.freeDeliveryThreshold;
  const appliedDeliveryFee = (threshold > 0 && cartTotal >= threshold) || (cartTotal === 0) ? 0 : deliverySettings.fee;
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
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-md overflow-hidden">
                       <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product image"/>
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-muted-foreground"><p>Subtotal</p><p>${cartTotal.toFixed(2)}</p></div>
              <div className="flex justify-between text-muted-foreground"><p>Delivery Fee</p>{isLoading ? <Skeleton className="h-5 w-12" /> : <p>${appliedDeliveryFee.toFixed(2)}</p>}</div>
               {appliedDeliveryFee === 0 && deliverySettings.fee > 0 && cartTotal > 0 && (
                <div className="flex justify-end"><Badge variant="secondary" className="bg-green-100 text-green-800">Free delivery applied!</Badge></div>
              )}
               {appliedPromo && (
                <div className="flex justify-between text-green-600"><p>Discount ({appliedPromo.id})</p><p>-${discountAmount.toFixed(2)}</p></div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg"><p>Total</p>{isLoading ? <Skeleton className="h-6 w-20" /> : <p>${finalTotal.toFixed(2)}</p>}</div>
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
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => { setAppliedPromo(null); setDiscountAmount(0); setPromoInput(""); }}>Remove code</Button>
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
