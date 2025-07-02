








import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit, DocumentData, DocumentSnapshot, Timestamp, doc, getDoc, setDoc, arrayUnion, updateDoc, runTransaction, serverTimestamp, addDoc, deleteDoc } from 'firebase/firestore';
import type { Product, Category, Order, Address, Review, DeliverySettings, PromoCode, UserProfile, AttributeSet } from './types';

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
        attributes: data.attributes || {},
        isVariant: data.isVariant || false,
        variantAttributeId: data.variantAttributeId,
        variants: data.variants || {},
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
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        discountAmount: data.discountAmount || 0,
        promoCode: data.promoCode || null,
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
        rating: data.rating,
        comment: data.comment,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    };
}

function docToPromoCode(doc: DocumentSnapshot<DocumentData>): PromoCode {
    const data = doc.data()!;
    return {
        id: doc.id,
        type: data.type || 'percentage',
        discountPercentage: data.discountPercentage,
        isActive: data.isActive,
    };
}

function docToUserProfile(doc: DocumentSnapshot<DocumentData>): UserProfile {
    const data = doc.data()!;
    return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        adminRole: data.adminRole || null,
    };
}

function docToAttributeSet(doc: DocumentSnapshot<DocumentData>): AttributeSet {
    const data = doc.data()!;
    return {
        id: doc.id,
        name: data.name,
        values: data.values || [],
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

export async function createUserInFirestore(userId: string, name: string, email: string, phone: string): Promise<void> {
  if (!userId) throw new Error("User ID is required to create user in Firestore.");
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { 
      name: name,
      email: email,
      phone: phone,
      adminRole: email.toLowerCase() === 'admin@gmail.com' ? 'main' : null,
    }, { merge: true });
  } catch (error) {
    console.error("Error creating user in Firestore:", error);
    throw error;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!userId) return null;
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            return docToUserProfile(docSnap);
        }
        return null;
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
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

export async function updateUserPhone(userId: string, phone: string): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { phone: phone });
  } catch (error) {
    console.error(`Error updating phone for user ${userId}:`, error);
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
      const currentRating = Number(productData.rating || 0);
      const currentReviewCount = Number(productData.reviewCount || 0);

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

export async function getDeliverySettings(): Promise<DeliverySettings> {
  const defaultSettings = { fee: 0, freeDeliveryThreshold: 0 };
  try {
    const settingsRef = doc(db, 'settings', 'delivery');
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          fee: data.fee || 0,
          freeDeliveryThreshold: data.freeDeliveryThreshold || 0,
        };
    }
    return defaultSettings;
  } catch (error) {
    console.error("Error fetching delivery settings:", error);
    return defaultSettings;
  }
}

export async function updateDeliverySettings(settings: DeliverySettings): Promise<void> {
  try {
    const settingsRef = doc(db, 'settings', 'delivery');
    await setDoc(settingsRef, settings, { merge: true });
  } catch (error) {
    console.error("Error updating delivery settings:", error);
    throw error;
  }
}

// == Promo Code Functions ==

export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const promoCodesCol = collection(db, 'promocodes');
    const snapshot = await getDocs(promoCodesCol);
    return snapshot.docs.map(docToPromoCode);
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return [];
  }
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
    if (!code) return null;
    try {
        const promoRef = doc(db, 'promocodes', code);
        const docSnap = await getDoc(promoRef);
        if (docSnap.exists() && docSnap.data().isActive) {
            return docToPromoCode(docSnap);
        }
        return null;
    } catch (error) {
        console.error("Error fetching promo code:", error);
        return null;
    }
}

export async function createPromoCode(promoData: {id: string, type: 'percentage' | 'free_delivery', discountPercentage?: number}): Promise<void> {
  try {
    const promoRef = doc(db, 'promocodes', promoData.id);
    const dataToSet: any = {
      type: promoData.type,
      isActive: true,
    };
    if (promoData.type === 'percentage' && promoData.discountPercentage) {
      dataToSet.discountPercentage = promoData.discountPercentage;
    }
    await setDoc(promoRef, dataToSet);
  } catch (error) {
    console.error("Error creating promo code:", error);
    throw error;
  }
}

export async function deletePromoCode(codeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "promocodes", codeId));
  } catch (error) {
    console.error("Error deleting promo code:", error);
    throw error;
  }
}

export async function hasUserUsedPromo(userId: string, promoCode: string): Promise<boolean> {
  if (!userId || !promoCode) return false;
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(
      ordersCol, 
      where('userId', '==', userId), 
      where('promoCode', '==', promoCode), 
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking promo code usage:", error);
    // Fail safe: if there's an error, assume they haven't used it to not block a valid user.
    return false;
  }
}

// == Admin Management Functions ==

export async function findUserByEmail(email: string): Promise<(UserProfile & { adminRole: string | null }) | null> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const userDoc = querySnapshot.docs[0];
    const userProfile = docToUserProfile(userDoc);
    return { ...userProfile, adminRole: userProfile.adminRole || null };
  } catch (error) {
    console.error("Error finding user by email:", error);
    return null;
  }
}

export async function updateUserAdminRole(userId: string, role: 'standard' | null): Promise<void> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { adminRole: role });
  } catch (error) {
    console.error(`Error updating admin role for user ${userId}:`, error);
    throw error;
  }
}

export async function getAdminUsers(): Promise<UserProfile[]> {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("adminRole", "in", ["main", "standard"]));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docToUserProfile);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return [];
  }
}

// == Attribute Management Functions ==

export async function getAttributes(): Promise<AttributeSet[]> {
  try {
    const attributesCol = collection(db, 'attributes');
    const q = query(attributesCol, orderBy('name'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docToAttributeSet);
  } catch (error) {
    console.error("Error fetching attributes:", error);
    return [];
  }
}

export async function createAttribute(data: Omit<AttributeSet, 'id'>): Promise<void> {
  try {
    await addDoc(collection(db, 'attributes'), data);
  } catch (error) {
    console.error("Error creating attribute:", error);
    throw error;
  }
}

export async function updateAttribute(id: string, data: Partial<Omit<AttributeSet, 'id'>>): Promise<void> {
  try {
    const attributeRef = doc(db, 'attributes', id);
    await updateDoc(attributeRef, data);
  } catch (error) {
    console.error("Error updating attribute:", error);
    throw error;
  }
}

export async function deleteAttribute(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, "attributes", id));
  } catch (error) {
    console.error("Error deleting attribute:", error);
    throw error;
  }
}
