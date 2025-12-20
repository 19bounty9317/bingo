// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGffa3OQOvZZgWkJxd_MxbWOAR49yflPc",
  authDomain: "rl-bingo-465a6.firebaseapp.com",
  projectId: "rl-bingo-465a6",
  storageBucket: "rl-bingo-465a6.firebasestorage.app",
  messagingSenderId: "1066602059596",
  appId: "1:1066602059596:web:dd9ea89513b18e5631a1e9",
  measurementId: "G-RMJK2WD9WY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);