import { products, orders } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminDashboardPage() {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  // This is a mock value
  const totalCustomers = 12;

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
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
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
            <p className="text-xs text-muted-foreground">+2 since last hour</p>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex items-center space-x-4">
                    <Avatar>
                        <AvatarImage src="https://i.pravatar.cc/40?u=a" data-ai-hint="user avatar" />
                        <AvatarFallback>AJ</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">New Order</p>
                        <p className="text-sm text-muted-foreground">
                            Alice Johnson placed an order for $45.50.
                        </p>
                    </div>
                </div>
                 <div className="flex items-center space-x-4">
                    <Avatar>
                        <AvatarImage src="https://i.pravatar.cc/40?u=b" data-ai-hint="user avatar" />
                        <AvatarFallback>BS</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">New Customer</p>
                        <p className="text-sm text-muted-foreground">
                            Bob Smith just signed up.
                        </p>
                    </div>
                </div>
                 <div className="flex items-center space-x-4">
                    <Avatar>
                         <AvatarFallback>
                            <Package className="h-5 w-5" />
                         </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium">New Product</p>
                        <p className="text-sm text-muted-foreground">
                            Organic Blueberries was added.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
       </div>
    </div>
  );
}
