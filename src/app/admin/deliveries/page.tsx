
"use client";

import { useEffect, useState } from "react";
import { DeliveriesTable } from "@/components/admin/DeliveriesTable";
import { getDeliveredOrders } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order, GroupedDeliveries } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDeliveriesPage() {
  const { user } = useAuth();
  const [groupedOrders, setGroupedOrders] = useState<GroupedDeliveries>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndGroupOrders = async () => {
    setIsLoading(true);
    const deliveredOrders = await getDeliveredOrders();
    
    const groups: GroupedDeliveries = {};
    for (const order of deliveredOrders) {
      const personId = order.deliveryPersonId || 'unassigned';
      const personName = order.deliveryPersonName || 'Unassigned';

      if (!groups[personId]) {
        groups[personId] = {
          personName,
          orders: [],
        };
      }
      groups[personId].orders.push(order);
    }

    setGroupedOrders(groups);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchAndGroupOrders();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Delivery Log</h1>
        <p className="text-muted-foreground">A log of all completed deliveries, grouped by delivery person.</p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <DeliveriesTable groupedDeliveries={groupedOrders} onDataChanged={fetchAndGroupOrders} />
      )}
    </div>
  );
}
