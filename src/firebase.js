// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALkJtLy-FOduyHGB97R5PCzprEXzBRoW0",
  authDomain: "appmonitoreo-e697d.firebaseapp.com",
  projectId: "appmonitoreo-e697d",
  storageBucket: "appmonitoreo-e697d.firebasestorage.app",
  messagingSenderId: "726230122930",
  appId: "1:726230122930:web:fe53e4f78059fc9c8d64ab",
  measurementId: "G-F56KR5CD8Y"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);    

