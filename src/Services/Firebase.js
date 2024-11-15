// src/Services/Firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_hmaI0ORU5wlUdzbh4zDDlriWIAgRd_k",
  authDomain: "driver-lms.firebaseapp.com",
  projectId: "driver-lms",
  storageBucket: "driver-lms.firebasestorage.app",
  messagingSenderId: "93684017875",
  appId: "1:93684017875:web:b086e83383112882f90226",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
