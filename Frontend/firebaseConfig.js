import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyAbyBcG25PxJJhLPbrrZdflULZ2RcIG2Ug",
  authDomain: "reactproject-a66d3.firebaseapp.com",
  projectId: "reactproject-a66d3",
  storageBucket: "reactproject-a66d3.firebasestorage.app",
  messagingSenderId: "847983672466",
  appId: "1:847983672466:web:ec402a7779112cae0a3a4b",
  measurementId: "G-ZFC1Q4GJCR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export default app;