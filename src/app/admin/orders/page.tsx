"use client";

import { useEffect, useState, useMemo } from "react";
import { OrderTable } from "@/components/admin/OrderTable";
import { getOrders } from "@/lib/data";
import { useAuth } from "@/context/AuthProvider";
import type { Order } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function AdminOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        setIsLoading(true);
        const allOrders = await getOrders();
        setOrders(allOrders);
        setIsLoading(false);
      };
      fetchOrders();
    }
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (!searchTerm) {
      return orders;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return orders.filter(order => 
        order.id.toLowerCase().includes(lowercasedTerm) ||
        order.customerName.toLowerCase().includes(lowercasedTerm) ||
        order.address.phone.includes(lowercasedTerm)
    );
  }, [orders, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by ID, name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
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
        <OrderTable orders={filteredOrders} />
      )}
    </div>
  );
}
