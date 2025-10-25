// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// =======================
// CONFIGURATION FIREBASE
// =======================
const firebaseConfig = {
    apiKey: "AIzaSyCZ0aKxn8Nxao8vlluD0nTbBssG7lzSwPo",
    authDomain: "rail-empire-b5278.firebaseapp.com",
    projectId: "rail-empire-b5278",
    storageBucket: "rail-empire-b5278.firebasestorage.app",
    messagingSenderId: "391417610159",
    appId: "1:391417610159:web:18c8ec8b692d9cbee0b95a",
    measurementId: "G-TME87RHCTC"
};

// =======================
// INITIALISATION FIREBASE
// =======================
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
