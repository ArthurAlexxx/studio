// src/lib/firebase/server.ts
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'server-only';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

const app = !getApps().length
  ? initializeApp({
      credential: serviceAccount ? cert(serviceAccount) : undefined,
    })
  : getApp();

const db = getFirestore(app);

export { app, db };
