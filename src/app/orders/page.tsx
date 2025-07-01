"use client";

import { orders } from "@/lib/data";
import type { Order } from "@/lib/types";
import { useAuth } from "@/context/AuthProvider";
import { AuthGuard } from "@/components/common/AuthGuard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import Image from "next/image";

function UserOrdersPage() {
    const { user } = useAuth();
    // In a real app, this would be fetched from Firebase based on the user's ID.
    // For now, we'll show all orders as a demonstration.
    const userOrders = orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const getStatusVariant = (status: Order['status']) => {
        switch (status) {
            case 'Pending': return 'default';
            case 'Processing': return 'secondary';
            case 'Shipped': return 'outline';
            case 'Delivered': return 'default'; // Success variant would be good here
            case 'Cancelled': return 'destructive';
            default: return 'default';
        }
    };

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground mb-8">View your order history and status.</p>
            {userOrders.length > 0 ? (
                <div className="space-y-6">
                    {userOrders.map(order => (
                        <Card key={order.id}>
                            <CardHeader className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                <div>
                                    <CardTitle>Order #{order.id}</CardTitle>
                                    <CardDescription>Placed on {format(order.createdAt, 'PPP')}</CardDescription>
                                </div>
                                <Badge variant={getStatusVariant(order.status)} className="w-fit">{order.status}</Badge>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
