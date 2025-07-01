import { getOrders, getProducts } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const revalidate = 0; // Revalidate on every request

export default async function AdminDashboardPage() {
  const orders = await getOrders();
  const products = await getProducts();
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  
  const uniqueCustomerIds = [...new Set(orders.map(o => o.userId))];
  const totalCustomers = uniqueCustomerIds.length;

  const recentActivity = orders.slice(0, 3);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {totalOrders} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Total products in store</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Who have placed orders</p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        <Card>
            <CardContent className="pt-6 space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map(order => (
                  <div key={order.id} className="flex items-center space-x-4">
                      <Avatar>
                          <AvatarImage src={`https://i.pravatar.cc/40?u=${order.userId}`} data-ai-hint="user avatar" />
                          <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                          <p className="text-sm font-medium">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                              Placed an order for ${order.total.toFixed(2)}.
                          </p>
                      </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center">No recent activity.</p>
              )}
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
