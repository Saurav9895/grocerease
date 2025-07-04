
"use client";

import type { Order } from "@/lib/types";
import { format } from "date-fns";
import { Leaf } from "lucide-react";

export const OrderReceipt = ({ order }: { order: Order }) => {
  if (!order) return null;

  return (
    <div className="p-8 bg-white text-black font-mono">
      <div className="flex justify-between items-center border-b-2 border-black pb-4">
        <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-black" />
            <h1 className="text-2xl font-bold">GrocerEase</h1>
        </div>
        <div className="text-right">
            <h2 className="text-xl font-bold">Invoice / Receipt</h2>
            <p>Order ID: {order.id}</p>
            <p>Date: {format(order.createdAt, 'PPP')}</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold underline">Shipping To:</h3>
        <p className="font-bold">{order.customerName}</p>
        <p>{order.address.apartment}</p>
        <p>{order.address.street}</p>
        <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
        <p>{order.address.country}</p>
        <p>Phone: {order.address.phone}</p>
         {order.address.googleMapsUrl && (
            <p className="text-xs">Map Link: <a href={order.address.googleMapsUrl} className="text-blue-600 underline break-all">{order.address.googleMapsUrl}</a></p>
        )}
      </div>
      
      <div className="mt-8">
        <table className="w-full">
            <thead>
                <tr className="border-b-2 border-dashed border-black">
                    <th className="text-left pb-2">Product Name</th>
                    <th className="text-center pb-2">Qty</th>
                    <th className="text-right pb-2">Unit Price</th>
                    <th className="text-right pb-2">Total</th>
                </tr>
            </thead>
            <tbody>
                {order.items.map(item => (
                    <tr key={item.id}>
                        <td className="py-2">{item.name}</td>
                        <td className="text-center py-2">{item.quantity}</td>
                        <td className="text-right py-2">Rs{item.price.toFixed(2)}</td>
                        <td className="text-right py-2">Rs{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between border-t border-dashed border-black pt-2">
                <span>Subtotal</span>
                <span>Rs{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs{order.deliveryFee.toFixed(2)}</span>
            </div>
             {order.discountAmount > 0 && (
                <div className="flex justify-between">
                    <span>Discount ({order.promoCode})</span>
                    <span>-Rs{order.discountAmount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t-2 border-black pt-2">
                <span>Grand Total</span>
                <span>Rs{order.total.toFixed(2)}</span>
            </div>
        </div>
      </div>
      
      <div className="mt-6 border-t-2 border-black pt-4">
        <h3 className="text-lg font-semibold">Payment Details</h3>
        <p>Payment Method: <span className="font-bold">{order.paymentMethod}</span></p>
      </div>
      
      <div className="mt-12 text-center text-sm">
        <p>Thank you for your purchase!</p>
        <p>GrocerEase | www.grocerease.example</p>
      </div>
    </div>
  );
};
