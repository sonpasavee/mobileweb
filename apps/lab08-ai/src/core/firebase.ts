import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ❗ analytics ไม่จำเป็นสำหรับงานนี้ (เอาออกได้)

const firebaseConfig = {
  apiKey: "AIzaSyAjppuSYXwMqM98MZqHyL_0-F-FYCIZSyI",
  authDomain: "lab06-a06f8.firebaseapp.com",
  projectId: "lab06-a06f8",
  storageBucket: "lab06-a06f8.firebasestorage.app",
  messagingSenderId: "743669470933",
  appId: "1:743669470933:web:c29adf1c91ba0b2ec1345c",
  measurementId: "G-9HXF0XH13G"
};

// ✅ ต้อง export แบบนี้
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);