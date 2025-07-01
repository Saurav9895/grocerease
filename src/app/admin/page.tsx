"use client";

import { useEffect, useState } from "react";
import { getOrders, getProducts, getCategories } from "@/lib/data";
import type { Order, Product, Category } from "@/lib/types";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users, ClipboardCheck, BarChartBig, LayoutList } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    recentOrders: Order[],
    recentProducts: Product[],
    allOrders: Order[],
    allProducts: Product[],
    allCategories: Category[]
  } | null>(null);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        const [recentOrders, recentProducts, allOrders, allProducts, allCategories] = await Promise.all([
          getOrders({ limit: 5 }),
          getProducts({ limit: 5 }),
          getOrders(),
          getProducts(),
          getCategories(),
        ]);
        setData({ recentOrders, recentProducts, allOrders, allProducts, allCategories });
        setIsLoading(false);
      };
      fetchData();
    }
  }, [user]);

  if (isLoading || !data) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-5 w-3/4" /></CardHeader><CardContent><Skeleton className="h-8 w-1/2" /></CardContent></Card>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="h-96"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>
          <Card className="h-96"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent><Skeleton className="h-full w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }
  
  const { recentOrders, recentProducts, allOrders, allProducts, allCategories } = data;
  const totalRevenue = allOrders.reduce((sum, order) => sum + order.total, 0);
  const totalSales = allOrders.length;
  const totalProducts = allProducts.length;
  
  const uniqueCustomerIds = [...new Set(allOrders.map(o => o.userId))];
  const totalCustomers = uniqueCustomerIds.length;

  const getStatusVariant = (status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') => {
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
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% (Mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales}</div>
            <p className="text-xs text-muted-foreground">+10.5% (Mock)</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+5% (Mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <BarChartBig className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSales}</div>
            <p className="text-xs text-muted-foreground">-2% (Mock)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest 5 customer orders from Firestore.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-primary hover:underline">
                      <Link href={`/admin/orders/${order.id}`}>{order.id.substring(0, 7)}...</Link>
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{format(order.createdAt, 'PPp')}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>Latest 5 products added to Firestore.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {recentProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center">
                    <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{allCategories.find(c => c.id === product.category)?.name || 'Uncategorized'}</p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-2">
                        <Package className="h-3 w-3" />
                        Stock: {product.stock}
                    </Badge>
                </div>
             ))}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
                <Link href="/admin/products">View All Products</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
