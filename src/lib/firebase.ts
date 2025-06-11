// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDvsnG_XrSorCOZPetnPOKUWUjh9f0Zca8",
    authDomain: "tableclick-284a7.firebaseapp.com",
    projectId: "tableclick-284a7",
    storageBucket: "tableclick-284a7.firebasestorage.app",
    messagingSenderId: "354687660514",
    appId: "1:354687660514:web:19b42c64c433449e4309bb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;