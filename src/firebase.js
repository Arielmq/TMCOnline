import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBhVKCGU5iv91fSjrU921oMZCAfAZeGPJ8",
  authDomain: "btmc-9d5ed.firebaseapp.com",
  projectId: "btmc-9d5ed",
  storageBucket: "btmc-9d5ed.appspot.com",
  messagingSenderId: "482673021893",
  appId: "1:482673021893:web:939eec92aadbe7b20a31ac",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

export default app;