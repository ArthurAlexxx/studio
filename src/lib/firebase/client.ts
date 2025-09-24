// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "studio-1428917996-c3da9",
  appId: "1:936474671620:web:81c9e3379fa204a427d351",
  apiKey: "AIzaSyAsS7FCblyl3tWGaxCjiiG-Ky55o5i_KHk",
  authDomain: "studio-1428917996-c3da9.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "936474671620"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
