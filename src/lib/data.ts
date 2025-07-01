
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit, DocumentData, DocumentSnapshot, Timestamp, doc, getDoc, setDoc, arrayUnion, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { Product, Category, Order, Address, Review } from './types';

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
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
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

function docToReview(doc: DocumentSnapshot<DocumentData>): Review {
    const data = doc.data()!;
    return {
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userAvatarUrl: data.userAvatarUrl,
        rating: data.rating,
        comment: data.comment,
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

export async function getCategoryById(id: string): Promise<Category | null> {
    try {
        const categoryRef = doc(db, 'categories', id);
        const docSnap = await getDoc(categoryRef);
        if (docSnap.exists()) {
            return docToCategory(docSnap);
        } else {
            console.warn(`No category found with id: ${id}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching category:", error);
        return null;
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

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const productsCol = collection(db, 'products');
    const q = query(productsCol, where('category', '==', categoryId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToProduct);
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
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

export async function getOrderById(id: string): Promise<Order | null> {
    try {
        const orderRef = doc(db, 'orders', id);
        const docSnap = await getDoc(orderRef);
        if (docSnap.exists()) {
            return docToOrder(docSnap);
        } else {
            console.warn(`No order found with id: ${id}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
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
    const addressWithId = { ...address, id: doc(collection(db, "users")).id };
    await setDoc(userDocRef, { 
      addresses: arrayUnion(addressWithId)
    }, { merge: true });
  } catch (error) {
    console.error("Error saving user address:", error);
    throw error;
  }
}

export async function updateUserAddress(userId: string, updatedAddress: Address) {
  if (!userId || !updatedAddress.id) throw new Error("User ID and Address ID are required.");
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const currentAddresses: Address[] = docSnap.data().addresses || [];
      const newAddresses = currentAddresses.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr);
      await updateDoc(userDocRef, { addresses: newAddresses });
    }
  } catch (error) {
    console.error("Error updating user address:", error);
    throw error;
  }
}

export async function deleteUserAddress(userId: string, addressId: string) {
  if (!userId || !addressId) throw new Error("User ID and Address ID are required.");
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const currentAddresses: Address[] = docSnap.data().addresses || [];
      const newAddresses = currentAddresses.filter(addr => addr.id !== addressId);
      await updateDoc(userDocRef, { addresses: newAddresses });
    }
  } catch (error) {
    console.error("Error deleting user address:", error);
    throw error;
  }
}

export async function getReviewsForProduct(productId: string): Promise<Review[]> {
  if (!productId) return [];
  try {
    const reviewsCol = collection(db, 'products', productId, 'reviews');
    const q = query(reviewsCol, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToReview);
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return [];
  }
}

export async function addReviewAndUpdateProduct(
  productId: string,
  review: Omit<Review, 'id' | 'createdAt'>
): Promise<void> {
  const productRef = doc(db, 'products', productId);
  const reviewColRef = collection(db, 'products', productId, 'reviews');
  const newReviewRef = doc(reviewColRef);

  try {
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw "Product does not exist!";
      }

      transaction.set(newReviewRef, { ...review, createdAt: serverTimestamp() });

      const productData = productDoc.data();
      const currentRating = productData.rating || 0;
      const currentReviewCount = productData.reviewCount || 0;

      const newReviewCount = currentReviewCount + 1;
      const newRating = (currentRating * currentReviewCount + review.rating) / newReviewCount;

      transaction.update(productRef, {
        rating: newRating,
        reviewCount: newReviewCount,
      });
    });
  } catch (error) {
    console.error("Transaction failed: ", error);
    throw new Error("Failed to submit review.");
  }
}
