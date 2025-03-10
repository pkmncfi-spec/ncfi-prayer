// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqU8HRiG_aDnTmL-_Zm4_6L9O62x03Aik",
  authDomain: "ncfi-prayer-71a01.firebaseapp.com",
  projectId: "ncfi-prayer-71a01",
  storageBucket: "ncfi-prayer-71a01.firebasestorage.app",
  messagingSenderId: "871581659411",
  appId: "1:871581659411:web:24a123392317073c7d6ae6",
  measurementId: "G-NTMRQ2Q6ME"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;