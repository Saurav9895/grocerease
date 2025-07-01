
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit, DocumentData, DocumentSnapshot, Timestamp, doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import type { Product, Category, Order, Address } from './types';

// == Helper Functions ==
function docToProduct(doc: DocumentSnapshot<DocumentData>): Product {
    const data = doc.data()!;
    return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        category: data.category,
        stock: data.stock,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    };
}

function docToCategory(doc: DocumentSnapshot<DocumentData>): Category {
    const data = doc.data()!;
    return {
        id: doc.id,
        name: data.name,
        description: data.description || '',
        imageUrl: data.imageUrl || 'https://placehold.co/100x100.png',
    };
}

function docToOrder(doc: DocumentSnapshot<DocumentData>): Order {
    const data = doc.data()!;
    return {
        id: doc.id,
        userId: data.userId,
        customerName: data.customerName,
        address: data.address,
        items: data.items,
        total: data.total,
        paymentMethod: data.paymentMethod,
        status: data.status,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    };
}

// == Data Fetching Functions ==
export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesCol = collection(db, 'categories');
    const q = query(categoriesCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToCategory);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function getProducts(options: { limit?: number } = {}): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const q = options.limit 
      ? query(productsCol, orderBy('createdAt', 'desc'), limit(options.limit))
      : query(productsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToProduct);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
    try {
        const productRef = doc(db, 'products', id);
        const docSnap = await getDoc(productRef);
        if (docSnap.exists()) {
            return docToProduct(docSnap);
        } else {
            console.warn(`No product found with id: ${id}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

export async function getOrders(options: { limit?: number } = {}): Promise<Order[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const q = options.limit
      ? query(ordersCol, orderBy('createdAt', 'desc'), limit(options.limit))
      : query(ordersCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToOrder);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  if (!userId) return [];
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToOrder);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

export async function getUserAddresses(userId: string): Promise<Address[]> {
  if (!userId) return [];
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists() && docSnap.data().addresses) {
      return docSnap.data().addresses;
    }
    return [];
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return [];
  }
}

export async function saveUserAddress(userId: string, address: Omit<Address, 'id'>) {
  if (!userId) return;
  try {
    const userDocRef = doc(db, 'users', userId);
    const addressWithId = { ...address, id: new Date().toISOString() };
    await setDoc(userDocRef, { 
      addresses: arrayUnion(addressWithId)
    }, { merge: true });
  } catch (error) {
    console.error("Error saving user address:", error);
    throw error;
  }
}
