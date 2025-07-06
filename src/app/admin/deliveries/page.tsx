
"use client";

import { useEffect, useState, useMemo } from "react";
import { DeliveriesTable } from "@/components/admin/DeliveriesTable";
import { getDeliveredOrders } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import type { DateRange } from "react-day-picker";

export default function AdminDeliveriesPage() {
  const { user, profile } = useAuth();
  const [allDeliveredOrders, setAllDeliveredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const fetchOrders = async () => {
    if (!profile) return;
    setIsLoading(true);
    
    const fetchOptions: { vendorId?: string } = {};
    if (profile.adminRole === 'vendor' && profile.vendorId) {
        fetchOptions.vendorId = profile.vendorId;
    }

    const orders = await getDeliveredOrders(fetchOptions);
    setAllDeliveredOrders(orders);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user && profile) {
      fetchOrders();
    }
  }, [user, profile]);
  
  const filteredOrders = useMemo(() => {
    if (!date?.from) {
        return allDeliveredOrders;
    }
    const start = startOfDay(date.from);
    const end = date.to ? endOfDay(date.to) : endOfDay(date.from);
    return allDeliveredOrders.filter(order => {
        if (!order.deliveredAt) return false;
        const deliveredDate = new Date(order.deliveredAt);
        return deliveredDate >= start && deliveredDate <= end;
    });
  }, [allDeliveredOrders, date]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Delivery Log</h1>
            <p className="text-muted-foreground">A chronological log of all completed deliveries.</p>
        </div>
        <div className="flex items-center gap-2">
            <DateRangePicker date={date} onDateChange={setDate} />
            {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Clear</Button>}
        </div>
      </div>
      
      {isLoading ? (
        <div className="border rounded-md">
            <div className="p-4"><Skeleton className="h-8 w-1/4" /></div>
            <div className="p-4 space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        </div>
      ) : (
        <DeliveriesTable orders={filteredOrders} />
      )}
    </div>
  );
}
