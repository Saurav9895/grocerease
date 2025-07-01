import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBKoHPdQZbj4p15h78nb21B3ZPm0rzzFA4",
  authDomain: "grocerease-6bd75.firebaseapp.com",
  projectId: "grocerease-6bd75",
  storageBucket: "grocerease-6bd75.appspot.com",
  messagingSenderId: "622451094597",
  appId: "1:622451094597:web:0a3c4e80fc998e2ba51f2c",
  measurementId: "G-QRE33VK0BY"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);
