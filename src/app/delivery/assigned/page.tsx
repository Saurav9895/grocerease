
"use client";

import { useEffect, useState, useMemo } from "react";
import { getOrdersForDeliveryPerson } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AssignedOrderTable } from "@/components/delivery/AssignedOrderTable";

export default function AssignedOrdersPage() {
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

  const actionableOrders = useMemo(() => {
    return orders.filter(o => ['Pending', 'Processing', 'Shipped'].includes(o.status));
  }, [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assigned Orders</h1>
        <p className="text-muted-foreground">All orders currently assigned to you for delivery.</p>
      </div>
      
      {isLoading ? (
        <div className="space-y-2">
            <div className="border rounded-md p-4 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
      ) : (
        <AssignedOrderTable orders={actionableOrders} />
      )}
    </div>
  );
}
