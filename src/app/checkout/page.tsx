
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
import { getDeliverySettings } from "@/lib/data";
import type { DeliverySettings } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

function CheckoutView() {
  const { cartItems, cartTotal } = useCart();
  const router = useRouter();
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({ fee: 0, freeDeliveryThreshold: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace("/");
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

  if (cartItems.length === 0) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
        <p className="text-muted-foreground mt-2">
          Redirecting you to the home page...
        </p>
      </div>
    );
  }
  
  const threshold = deliverySettings.freeDeliveryThreshold;
  const appliedDeliveryFee = threshold > 0 && cartTotal >= threshold ? 0 : deliverySettings.fee;
  const finalTotal = cartTotal + appliedDeliveryFee;

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <CheckoutForm deliveryFee={appliedDeliveryFee} />
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
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-muted-foreground">
                <p>Subtotal</p>
                <p>${cartTotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <p>Delivery Fee</p>
                {isLoading ? <Skeleton className="h-5 w-12" /> : <p>${appliedDeliveryFee.toFixed(2)}</p>}
              </div>
               {appliedDeliveryFee === 0 && deliverySettings.fee > 0 && (
                <div className="flex justify-end">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">Free delivery applied!</Badge>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <p>Total</p>
                 {isLoading ? <Skeleton className="h-6 w-20" /> : <p>${finalTotal.toFixed(2)}</p>}
              </div>
            </CardContent>
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
