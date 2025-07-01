"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "./firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import type { CartItem, Product } from "./types";

const checkoutSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  paymentMethod: z.enum(["COD", "Online"]),
});

export async function placeOrder(cartItems: CartItem[], cartTotal: number, userId: string, formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = checkoutSchema.safeParse(rawFormData);
  
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  if (cartItems.length === 0) {
    return {
      success: false,
      errors: { _form: ["Your cart is empty."] },
    };
  }
  
  try {
    const newOrder = {
      userId,
      customerName: validatedFields.data.name,
      address: validatedFields.data.address,
      items: cartItems.map(({ id, name, price, quantity, imageUrl }) => ({ id, name, price, quantity, imageUrl })),
      total: cartTotal,
      paymentMethod: validatedFields.data.paymentMethod,
      status: 'Pending' as const,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), newOrder);
    
    revalidatePath("/");
    revalidatePath("/checkout");
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/orders");

    return { success: true, orderId: docRef.id };

  } catch (error) {
    console.error("Error placing order:", error);
    return {
      success: false,
      errors: { _form: ["An unexpected error occurred while placing your order."] },
    };
  }
}


// --- Admin Product Actions ---

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  price: z.coerce.number().min(0.01, "Price must be a positive number."),
  category: z.string().min(1, "Please select a category."),
  stock: z.coerce.number().int().min(0, "Stock must be a non-negative number."),
  imageUrl: z.string().url("Please enter a valid image URL."),
});


export async function addProduct(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = productSchema.omit({ id: true }).safeParse(rawFormData);

  if(!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addDoc(collection(db, "products"), {
      ...validatedFields.data,
      createdAt: serverTimestamp()
    });
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding product:", error);
    return {
      success: false,
      errors: { _form: ["Failed to add product to database."] },
    };
  }
}

export async function updateProduct(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = productSchema.safeParse(rawFormData);

  if(!validatedFields.success || !validatedFields.data.id) {
    return {
      success: false,
      errors: validatedFields.error?.flatten().fieldErrors || {_form: ['Invalid product data']},
    };
  }
  
  try {
    const { id, ...productData } = validatedFields.data;
    const productRef = doc(db, "products", id);
    await updateDoc(productRef, productData);
    
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      errors: { _form: ["Failed to update product in database."] },
    };
  }
}


export async function deleteProduct(productId: string) {
  if (!productId) {
    return { success: false, message: "Product ID is missing." };
  }
  try {
    await deleteDoc(doc(db, "products", productId));
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, message: "Failed to delete product." };
  }
}


// --- Admin Category Actions ---

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  imageUrl: z.string().url("Please enter a valid image URL."),
});


export async function addCategory(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = categorySchema.omit({ id: true }).safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await addDoc(collection(db, "categories"), validatedFields.data);
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error adding category:", error);
    return {
      success: false,
      errors: { _form: ["Failed to add category to database."] },
    };
  }
}

export async function updateCategory(formData: FormData) {
  const rawFormData = Object.fromEntries(formData.entries());
  const validatedFields = categorySchema.safeParse(rawFormData);

  if(!validatedFields.success || !validatedFields.data.id) {
    return {
      success: false,
      errors: validatedFields.error?.flatten().fieldErrors || {_form: ['Invalid category data']},
    };
  }
  
  try {
    const { id, ...categoryData } = validatedFields.data;
    const categoryRef = doc(db, "categories", id);
    await updateDoc(categoryRef, categoryData);
    
    revalidatePath("/admin/categories");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      errors: { _form: ["Failed to update category in database."] },
    };
  }
}

export async function deleteCategory(categoryId: string) {
  if (!categoryId) {
    return { success: false, message: "Category ID is missing." };
  }
  try {
    await deleteDoc(doc(db, "categories", categoryId));
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, message: "Failed to delete category." };
  }
}
