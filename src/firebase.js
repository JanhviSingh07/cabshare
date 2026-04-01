import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDqvSsd1_KP37LviA_WwM121CVgOZly9zg",
  authDomain: "project-firebase-1-9e2d2.firebaseapp.com",
  projectId: "project-firebase-1-9e2d2",
  storageBucket: "project-firebase-1-9e2d2.firebasestorage.app",
  messagingSenderId: "870205262446",
  appId: "1:870205262446:web:d51476e428a78990e9b47f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
