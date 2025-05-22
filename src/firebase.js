import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBhVKCGU5iv91fSjrU921oMZCAfAZeGPJ8",
  authDomain: "btmc-9d5ed.firebaseapp.com",
  projectId: "btmc-9d5ed",
  storageBucket: "import.meta.env.VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "482673021893",
  appId: "1:482673021893:web:939eec92aadbe7b20a31ac",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);