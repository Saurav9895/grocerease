"use client";

import type { Order } from "@/lib/types";
import { useAuth } from "@/context/AuthProvider";
import { AuthGuard } from "@/components/common/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getUserOrders } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

function UserOrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchOrders = async () => {
                setIsLoading(true);
                const userOrders = await getUserOrders(user.uid);
                setOrders(userOrders);
                setIsLoading(false);
            };
            fetchOrders();
        }
    }, [user]);

    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'Pending': return 'default';
            case 'Processing': return 'secondary';
            case 'Shipped': return 'outline';
            case 'Delivered': return 'default';
            case 'Cancelled': return 'destructive';
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <div className="container py-12">
                <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                <p className="text-muted-foreground mb-8">View your order history and status.</p>
                <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-48 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground mb-8">View your order history and status.</p>
            {orders.length > 0 ? (
                <div className="space-y-6">
                    {orders.map(order => (
                        <Card key={order.id}>
                            <CardHeader className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                <div>
                                    <CardTitle>Order #{order.id.substring(0, 7)}...</CardTitle>
                                    <CardDescription>Placed on {format(order.createdAt, 'PPP')}</CardDescription>
                                </div>
                                <Badge variant={getStatusVariant(order.status)} className="w-fit">{order.status}</Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">Shipping to:</p>
                                    <div className="text-muted-foreground">
                                      <p>{order.address.name}</p>
                                      <p>{order.address.street}</p>
                                      <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                                      <p>{order.address.country}</p>
                                    </div>
                                </div>
                                <Separator />
                                {order.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center">
                                      <div className="flex items-center gap-4">
                                        <div className="relative h-12 w-12 rounded-md overflow-hidden">
                                          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" data-ai-hint="product image"/>
                                        </div>
                                        <div>
                                          <p className="font-medium">{item.name}</p>
                                          <p className="text-sm text-muted-foreground">
                                            Qty: {item.quantity} x ${item.price.toFixed(2)}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                ))}
                            </CardContent>
                            <Separator />
                            <CardFooter className="pt-4 flex justify-end font-semibold text-lg">
                                <p>Total: ${order.total.toFixed(2)}</p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">You haven&apos;t placed any orders yet.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}


export default function OrdersPage() {
    return (
        <AuthGuard>
            <UserOrdersPage />
        </AuthGuard>
    )
}
