
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
import { format } from "date-fns";
import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { Eye, CheckCircle2, CircleDashed } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface DeliveryLogTableProps {
  orders: Order[];
}

export function DeliveryLogTable({ orders }: DeliveryLogTableProps) {
  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Order ID</TableHead>
              <TableHead className="whitespace-nowrap">Customer</TableHead>
              <TableHead className="whitespace-nowrap">Delivered At</TableHead>
              <TableHead className="whitespace-nowrap">Payment</TableHead>
              <TableHead className="whitespace-nowrap">Submission</TableHead>
              <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    <Link href={`/delivery/orders/${order.id}`} className="hover:underline text-primary">
                      {order.id.substring(0, 7)}...
                    </Link>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{order.customerName}</TableCell>
                  <TableCell className="whitespace-nowrap">{order.deliveredAt ? format(order.deliveredAt, 'PPp') : 'N/A'}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant="outline">{order.paymentMethod}</Badge> Rs{order.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                      {order.paymentSubmitted ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Submitted
                          </Badge>
                      ) : (
                          <Badge variant="secondary">
                              <CircleDashed className="mr-2 h-4 w-4" /> Pending
                          </Badge>
                      )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                      <Button asChild variant="outline" size="sm">
                          <Link href={`/delivery/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                          </Link>
                      </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No deliveries found for the selected date.
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
                      <span className="text-muted-foreground">Delivered</span>
                      <span className="font-medium text-right">{order.deliveredAt ? format(order.deliveredAt, 'PP') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-medium text-right"><Badge variant="outline" className="mr-1">{order.paymentMethod}</Badge> Rs{order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Submission</span>
                      <span>
                        {order.paymentSubmitted ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                                <CheckCircle2 className="mr-1 h-3 w-3" /> Submitted
                            </Badge>
                        ) : (
                            <Badge variant="secondary">
                                <CircleDashed className="mr-1 h-3 w-3" /> Pending
                            </Badge>
                        )}
                      </span>
                  </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 text-muted-foreground bg-card rounded-lg">
            <p>No deliveries found for the selected date.</p>
          </div>
        )}
      </div>
    </>
  );
}
