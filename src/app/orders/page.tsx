
"use client";

import type { Order } from "@/lib/types";
import { useAuth } from "@/context/AuthProvider";
import { AuthGuard } from "@/components/common/AuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { getUserOrders } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
            case 'Pending': return 'secondary';
            case 'Processing': return 'default';
            case 'Shipped': return 'outline';
            case 'Delivered': return 'default';
            case 'Cancelled': return 'destructive';
            default: return 'secondary';
        }
    };

    if (isLoading) {
        return (
            <div className="container py-12">
                <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
                <Card>
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[...Array(3)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-20 rounded-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-9 w-24 rounded-md" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="block md:hidden space-y-4 p-4">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-36 w-full" />
                        ))}
                    </div>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
            {orders.length > 0 ? (
                 <>
                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map(order => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">
                                                <Link href={`/orders/${order.id}`} className="text-primary hover:underline">
                                                    {order.id}
                                                </Link>
                                                </TableCell>
                                                <TableCell>{format(order.createdAt, 'PP')}</TableCell>
                                                <TableCell>Rs{order.total.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button asChild variant="outline" size="sm">
                                                        <Link href={`/orders/${order.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                    {/* Mobile View */}
                    <div className="block md:hidden space-y-4">
                        {orders.map(order => (
                            <Card key={order.id} className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Order ID</p>
                                        <Link href={`/orders/${order.id}`} className="font-medium hover:underline text-primary">
                                            {order.id.substring(0, 10)}...
                                        </Link>
                                    </div>
                                    <Link href={`/orders/${order.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Link>
                                </div>
                                <div className="space-y-3 text-sm border-t pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Date</span>
                                        <span className="font-medium text-right">{format(order.createdAt, 'PP')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total</span>
                                        <span className="font-medium text-right">Rs{order.total.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Status</span>
                                        <span>
                                            <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </>
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
