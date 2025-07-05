
"use client";

import { useEffect, useState, useMemo } from "react";
import { getOrdersForDeliveryPerson } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, CheckCircle2, DollarSign } from "lucide-react";

export default function DeliveryDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setIsLoading(true);
        const assignedOrders = await getOrdersForDeliveryPerson(user.uid);
        setOrders(assignedOrders);
        setIsLoading(false);
      };
      fetchOrders();
    }
  }, [user]);

  const stats = useMemo(() => {
    const actionableOrders = orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status));
    const deliveredOrders = orders.filter(o => o.status === 'Delivered');
    const pendingSubmissions = deliveredOrders.filter(o => o.paymentMethod === 'COD' && !o.paymentSubmitted);
    const pendingSubmissionsAmount = pendingSubmissions.reduce((sum, order) => sum + order.total, 0);

    return {
      activeCount: actionableOrders.length,
      deliveredCount: deliveredOrders.length,
      pendingSubmissionsCount: pendingSubmissions.length,
      pendingSubmissionsAmount,
    };
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Delivery Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCount}</div>
            <p className="text-xs text-muted-foreground">Orders to be delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveredCount}</div>
            <p className="text-xs text-muted-foreground">All-time delivered orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Submissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs{stats.pendingSubmissionsAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingSubmissionsCount} COD order(s) to submit</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
