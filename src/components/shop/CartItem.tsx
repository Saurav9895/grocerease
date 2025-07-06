

"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import type { CartItem as CartItemType } from '@/lib/types';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
  onOpenChange?: (isOpen: boolean) => void;
}

export function CartItem({ item, onOpenChange }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();
  
  const variantText = item.selectedOptions 
    ? Object.values(item.selectedOptions).join(' / ')
    : null;

  return (
    <div className="flex items-start space-x-4 py-4">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          data-ai-hint={`${item.category.replace(/-/g, ' ')} grocery`}
        />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div className="pr-2">
            <Link
              href={`/product/${item.productId}`}
              className="font-medium hover:underline"
              onClick={() => onOpenChange?.(false)}
            >
              {item.name}
            </Link>
            {variantText && (
                <p className="text-sm text-muted-foreground">{variantText}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Rs{item.price.toFixed(2)} / unit
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => removeFromCart(item.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Remove item</span>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-4 w-4" />
              <span className="sr-only">Decrease quantity</span>
            </Button>
            <Input
              type="number"
              aria-label="Item quantity"
              value={item.quantity}
              onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (val > 0) {
                      updateQuantity(item.id, val)
                  }
              }}
              className="h-8 w-12 text-center"
              min="1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
              <span className="sr-only">Increase quantity</span>
            </Button>
          </div>
          <p className="font-semibold">Rs{(item.price * item.quantity).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
