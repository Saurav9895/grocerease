"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { products, orders } from "./data";
import type { Order, CartItem, Product } from "./types";

const checkoutSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  paymentMethod: z.enum(["COD", "Online"]),
});

export async function placeOrder(cartItems: CartItem[], cartTotal: number, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = checkoutSchema.safeParse(rawFormData);
  
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  if (cartItems.length === 0) {
    return {
      errors: { _form: ["Your cart is empty."] },
    };
  }
  
  const newOrder: Order = {
    id: `ORD${(orders.length + 1).toString().padStart(3, '0')}`,
    customerName: validatedFields.data.name,
    address: validatedFields.data.address,
    items: cartItems,
    total: cartTotal,
    paymentMethod: validatedFields.data.paymentMethod,
    status: 'Pending',
    createdAt: new Date(),
  };

  // In a real app, you would save this to Firebase
  orders.push(newOrder);

  console.log("New order placed:", newOrder);

  revalidatePath("/");
  revalidatePath("/checkout");
  revalidatePath("/admin/orders");

  return { success: true, orderId: newOrder.id };
}


// --- Admin Actions ---

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().min(0.01),
  category: z.string().min(1),
  stock: z.coerce.number().int().min(0),
  imageUrl: z.string().url(),
});


export async function addProduct(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = productSchema.safeParse(rawFormData);

  if(!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const newProduct: Product = {
    ...validatedFields.data,
    id: `PROD${(products.length + 1).toString()}`,
  };

  products.push(newProduct);
  revalidatePath("/admin/products");

  return { success: true };
}

export async function updateProduct(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = productSchema.safeParse(rawFormData);

  if(!validatedFields.success || !validatedFields.data.id) {
    return {
      errors: validatedFields.error?.flatten().fieldErrors || {_form: ['Invalid product data']},
    };
  }
  
  const { id, ...productData } = validatedFields.data;
  const productIndex = products.findIndex(p => p.id === id);

  if(productIndex === -1) {
    return { errors: {_form: ['Product not found']} };
  }

  products[productIndex] = { ...products[productIndex], ...productData };
  revalidatePath("/admin/products");
  
  return { success: true };
}


export async function deleteProduct(productId: string) {
  const index = products.findIndex(p => p.id === productId);
  if (index !== -1) {
    products.splice(index, 1);
    revalidatePath("/admin/products");
    return { success: true };
  }
  return { success: false, message: "Product not found" };
}
