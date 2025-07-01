
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getOrderById } from "@/lib/data";
import type { Order } from "@/lib/types";
import { useAuth } from "@/context/AuthProvider";
import { AuthGuard } from "@/components/common/AuthGuard";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Home, Phone } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { OrderTracker } from "@/components/shop/OrderTracker";

function OrderDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && typeof id === 'string') {
      const fetchOrder = async () => {
        setIsLoading(true);
        const fetchedOrder = await getOrderById(id);
        
        // Security check: ensure the fetched order belongs to the current user
        if (fetchedOrder && fetchedOrder.userId === user.uid) {
          setOrder(fetchedOrder);
        } else {
          setOrder(null);
        }
        setIsLoading(false);
      };
      fetchOrder();
    }
  }, [id, user]);
  
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Processing': return 'default';
      case 'Shipped': return 'outline';
      case 'Delivered': return 'default';
      case 'Cancelled': return 'destructive';
      default: return 'secondary';
    }
  };
  
  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="container py-10 text-center">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground">The requested order could not be found or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/orders')} className="mt-4">Back to My Orders</Button>
      </div>
    );
  }

  return (
    <div className="container py-12 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
            <h1 className="text-2xl md:text-3xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order ID: {order.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Track Your Order</CardTitle>
            <CardDescription>See the current status of your delivery.</CardDescription>
        </CardHeader>
        <CardContent>
            <OrderTracker currentStatus={order.status} />
        </CardContent>
      </Card>


      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Products Ordered</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden sm:table-cell">Image</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="hidden sm:table-cell">
                         <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md object-cover" data-ai-hint="product image"/>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>x{item.quantity}</TableCell>
                      <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium">{format(order.createdAt, 'PPP')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <Separator />
               <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${order.subtotal.toFixed(2)}</span>
              </div>
               <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery:</span>
                <span className="font-medium">${order.deliveryFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{order.address.phone}</span>
                </div>
                <div className="flex items-start gap-3">
                    <Home className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div className="text-muted-foreground">
                        <p>{order.address.street}</p>
                        <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                        <p>{order.address.country}</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
     <div className="container py-12 space-y-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
        </div>
      </div>

      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="flex justify-around py-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-16 w-16 rounded-full" />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-8 w-full" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}

export default function UserOrderDetailPage() {
    return (
        <AuthGuard>
            <OrderDetailPageContent />
        </AuthGuard>
    )
}
