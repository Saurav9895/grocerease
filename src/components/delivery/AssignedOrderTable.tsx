
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@/lib/types";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { Eye } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface AssignedOrderTableProps {
  orders: Order[];
}

export function AssignedOrderTable({ orders }: AssignedOrderTableProps) {

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


  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link href={`/delivery/orders/${order.id}`} className="hover:underline text-primary">
                      {order.id.substring(0, 7)}...
                    </Link>
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.address.street}, {order.address.city}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                          <Link href={`/delivery/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                          </Link>
                      </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No orders assigned to you.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Mobile View */}
      <div className="block md:hidden space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => (
             <Card key={order.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <Link href={`/delivery/orders/${order.id}`} className="font-medium hover:underline text-primary">
                    {order.id.substring(0, 10)}...
                  </Link>
                </div>
                <Link href={`/delivery/orders/${order.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                </Link>
              </div>
              
              <div className="space-y-3 text-sm border-t pt-4">
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium text-right">{order.customerName}</span>
                  </div>
                   <div className="flex justify-between">
                      <span className="text-muted-foreground">Address</span>
                      <span className="font-medium text-right">{order.address.street}, {order.address.city}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status</span>
                      <span>
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                      </span>
                  </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
            <p>No orders assigned to you.</p>
          </div>
        )}
      </div>
    </>
  );
}
