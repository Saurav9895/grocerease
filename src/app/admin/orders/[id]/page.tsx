

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getOrderById } from "@/lib/data";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthProvider";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Home, CreditCard, Phone, Printer } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { OrderReceipt } from "@/components/admin/OrderReceipt";

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
const orderStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];


export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);

  const fetchOrder = async (orderId: string) => {
    setIsLoading(true);
    const fetchedOrder = await getOrderById(orderId);
    setOrder(fetchedOrder);
    if (fetchedOrder) {
      setSelectedStatus(fetchedOrder.status);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user && typeof id === 'string') {
      fetchOrder(id);
    }
  }, [id, user]);
  
  const handleStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    setIsUpdating(true);
    try {
      const orderRef = doc(db, "orders", order.id);
      await updateDoc(orderRef, { status: selectedStatus });
      
      await fetchOrder(order.id);

      toast({
        title: "Status Updated",
        description: `Order status changed to ${selectedStatus}.`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the order status.",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handlePrint = () => {
    window.print();
  };


  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground">The requested order could not be found.</p>
        <Button onClick={() => router.push('/admin/orders')} className="mt-4">Back to Orders</Button>
      </div>
    );
  }

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


  return (
    <>
      <div className="space-y-6 no-print">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
              <h1 className="text-2xl font-bold">Order Details</h1>
              <p className="text-muted-foreground">Order ID: {order.id}</p>
          </div>
           <Button variant="outline" onClick={handlePrint} className="ml-auto">
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Products</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                           <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="rounded-md object-cover" data-ai-hint="product image"/>
                        </TableCell>
                        <TableCell>
                          <Link href={`/product/${item.productId}`} target="_blank" className="font-medium hover:underline text-primary">
                            {item.name}
                          </Link>
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className="text-right">Rs{item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">Rs{(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Order Placed:</span>
                  <span>{format(order.createdAt, 'PPP')}</span>
                </div>
                 <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                </div>
                <Separator />
                 <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery:</span>
                  <span>Rs{order.deliveryFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>Rs{order.total.toFixed(2)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 items-stretch">
                  <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as OrderStatus)}>
                      <SelectTrigger>
                          <SelectValue placeholder="Change status..." />
                      </SelectTrigger>
                      <SelectContent>
                          {orderStatuses.map(status => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                  <Button onClick={handleStatusUpdate} disabled={isUpdating || selectedStatus === order.status}>
                      {isUpdating ? "Updating..." : "Update Status"}
                  </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer & Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{order.address.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                      <Home className="w-4 h-4 mt-0.5 text-muted-foreground" />
                      <div className="text-muted-foreground">
                          {order.address.apartment && <p>{order.address.apartment}</p>}
                          <p>{order.address.street}</p>
                          <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                          <p>{order.address.country}</p>
                      </div>
                  </div>
                   <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span>Payment: {order.paymentMethod}</span>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="hidden print-only">
        <OrderReceipt order={order} />
      </div>
    </>
  );
}

function OrderDetailSkeleton() {
  return (
     <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div>
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
            <Card>
                <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-8 w-full" />
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardFooter>
            </Card>
             <Card>
                <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-5 w-full" />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
