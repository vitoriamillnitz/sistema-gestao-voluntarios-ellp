// Importa o inicializador
import { initializeApp } from "firebase/app";

// 👇 Importa os DOIS serviços que vamos usar
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Sua configuração (do seu print, está correta)
const firebaseConfig = {
  apiKey: "AIzaSyAyvoOpqvZ-dDWKo3B85_naZk03kYCLQ-Y",
  authDomain: "volluntariado-ellp.firebaseapp.com",
  projectId: "volluntariado-ellp",
  storageBucket: "volluntariado-ellp.firebasestorage.app",
  messagingSenderId: "631949027256",
  appId: "1:631949027256:web:feb1ab495b526b488cd14d",
  measurementId: "G-W4L16Q8P3J"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// 👇 A MÁGICA: Inicializa os serviços e EXPORTA eles
export const auth = getAuth(app);
export const db = getFirestore(app);