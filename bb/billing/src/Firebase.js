// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA9_-tTo6W2U6GFx0GSRVr3GUMHniC9lWg",
  authDomain: "deore-billing.firebaseapp.com",
  databaseURL: "https://deore-billing-default-rtdb.firebaseio.com",
  projectId: "deore-billing",
  storageBucket: "deore-billing.appspot.com",
  messagingSenderId: "132312194842",
  appId: "1:132312194842:web:706f7ea0a3c88b76e5d6a3",
  measurementId: "G-LQYSWP3D2H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const database = getDatabase(app);

// Export all auth methods you need
export { 
  auth,
  database,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
};