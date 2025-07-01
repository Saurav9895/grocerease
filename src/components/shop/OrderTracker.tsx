"use client";

import { cn } from "@/lib/utils";
import type { Order } from "@/lib/types";
import { CheckCircle2, Loader, Truck, Home } from "lucide-react";
import React from "react";

const statusSteps: { status: Order['status']; label: string; icon: React.ElementType }[] = [
  { status: "Pending", label: "Order Placed", icon: CheckCircle2 },
  { status: "Processing", label: "Processing", icon: Loader },
  { status: "Shipped", label: "Shipped", icon: Truck },
  { status: "Delivered", label: "Delivered", icon: Home },
];

interface OrderTrackerProps {
  currentStatus: Order['status'];
}

export function OrderTracker({ currentStatus }: OrderTrackerProps) {
    const currentStatusIndex = statusSteps.findIndex(step => step.status === currentStatus);
    const isCancelled = currentStatus === 'Cancelled';
    
    if (isCancelled) {
        return (
             <div className="flex items-center justify-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-destructive font-medium">This order has been cancelled.</p>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between w-full relative pt-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-muted mt-[-1rem]">
                <div 
                    className="h-full bg-primary transition-all duration-500" 
                    style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                />
            </div>

            {statusSteps.map((step, index) => {
                const isActive = index <= currentStatusIndex;
                const Icon = step.icon;

                return (
                    <div key={step.status} className="z-10 flex flex-col items-center">
                        <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300",
                            isActive ? "bg-primary text-primary-foreground" : "bg-card border-2"
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <p className={cn(
                            "mt-2 text-xs text-center font-medium w-20",
                            isActive ? "text-primary" : "text-muted-foreground"
                        )}>
                            {step.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
