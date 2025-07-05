

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, updateOrderStatus, verifyOtpAndCompleteOrder } from "@/lib/data";
import type { Order } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthProvider";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Home, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
const deliveryPersonStatuses: OrderStatus[] = ['Shipped', 'Delivered'];


export default function DeliveryOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');

  const fetchOrder = async (orderId: string) => {
    setIsLoading(true);
    const fetchedOrder = await getOrderById(orderId);

    // Security check: ensure the fetched order is assigned to the current delivery person
    if (fetchedOrder && fetchedOrder.deliveryPersonId === user?.uid) {
        setOrder(fetchedOrder);
        if (fetchedOrder) {
          setSelectedStatus(fetchedOrder.status);
        }
    } else {
        setOrder(null);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (user && typeof id === 'string') {
      fetchOrder(id);
    }
  }, [id, user]);
  
  const handleAttemptStatusUpdate = async () => {
    if (!order || !selectedStatus || selectedStatus === order.status) return;

    if (selectedStatus === 'Delivered') {
      setOtpInput('');
      setIsOtpDialogOpen(true);
    } else { // For 'Shipped' status
      setIsUpdating(true);
      try {
        await updateOrderStatus(order.id, selectedStatus);
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
    }
  };

  const handleConfirmDelivery = async () => {
    if (!order || otpInput.length !== 6) {
        toast({
            variant: "destructive",
            title: "Invalid OTP",
            description: "Please enter a 6-digit OTP.",
        });
        return;
    }
    
    setIsUpdating(true);
    try {
        const success = await verifyOtpAndCompleteOrder(order.id, otpInput);
        if (success) {
            toast({
                title: "Order Delivered!",
                description: `Order status successfully updated.`,
            });
            setIsOtpDialogOpen(false);
            await fetchOrder(order.id);
        } else {
            toast({
                variant: "destructive",
                title: "Invalid OTP",
                description: "The OTP you entered is incorrect. Please try again.",
            });
        }
    } catch (error) {
        console.error("Error confirming delivery:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the order status.",
        });
    } finally {
        setIsUpdating(false);
    }
  };
  
  if (isLoading) {
    return <DeliverySkeleton />;
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Order Not Found</h2>
        <p className="text-muted-foreground">The requested order could not be found or is not assigned to you.</p>
        <Button onClick={() => router.push('/delivery')} className="mt-4">Back to My Orders</Button>
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
      <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
                <h1 className="text-2xl font-bold">Delivery Details</h1>
                <p className="text-muted-foreground">Order ID: {order.id}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
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
                            <p>{order.address.apartment}, {order.address.street}</p>
                            <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                            <p>{order.address.country}</p>
                            {order.address.googleMapsUrl && (
                              <a href={order.address.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1 mt-2">
                                  <MapPin className="w-4 h-4" />
                                  View on Map
                              </a>
                            )}
                        </div>
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                  <CardDescription>Current status: <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge></CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 items-stretch">
                    <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as OrderStatus)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Change status..." />
                        </SelectTrigger>
                        <SelectContent>
                            {deliveryPersonStatuses.map(status => (
                                <SelectItem key={status} value={status} disabled={order.status === 'Delivered'}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handleAttemptStatusUpdate} disabled={isUpdating || selectedStatus === order.status || order.status === 'Delivered'}>
                        {isUpdating ? "Updating..." : "Update Status"}
                    </Button>
                </CardFooter>
              </Card>
          </div>

          <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <span className="font-medium">{item.name}</span>
                          </TableCell>
                          <TableCell>x{item.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
      </div>
      <AlertDialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter Delivery OTP</AlertDialogTitle>
            <AlertDialogDescription>
              Please ask the customer for the 6-digit OTP to confirm delivery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input 
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              maxLength={6}
              placeholder="_ _ _ _ _ _"
              className="text-center text-2xl tracking-[0.5em]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelivery} disabled={isUpdating}>
              {isUpdating ? "Verifying..." : "Confirm Delivery"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function DeliverySkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
          <CardContent><Skeleton className="h-10 w-full" /></CardContent>
          <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
        </Card>
      </div>
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
