// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyvoOpqvZ-dDWKo3B85_naZk03kYCLQ-Y",
  authDomain: "volluntariado-ellp.firebaseapp.com",
  projectId: "volluntariado-ellp",
  storageBucket: "volluntariado-ellp.firebasestorage.app",
  messagingSenderId: "631949027256",
  appId: "1:631949027256:web:feb1ab495b526b488cd14d",
  measurementId: "G-W4L16Q8P3J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);