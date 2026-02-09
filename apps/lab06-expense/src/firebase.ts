import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

// Firebase config (ใช้ของคุณได้เลย)
const firebaseConfig = {
  apiKey: "AIzaSyAjppuSYXwMqM98MZqHyL_0-F-FYCIZSyI",
  authDomain: "lab06-a06f8.firebaseapp.com",
  projectId: "lab06-a06f8",
  storageBucket: "lab06-a06f8.firebasestorage.app",
  messagingSenderId: "743669470933",
  appId: "1:743669470933:web:d1eed526779ccbe3c1345c"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// 👉 อันนี้สำคัญ
export const db = getFirestore(app)
