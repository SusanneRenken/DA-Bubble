import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyAhQi1adgAX2v3PLkdRUDRJr48llcDiTPU",
  authDomain: "dabubble-586d2.firebaseapp.com",
  projectId: "dabubble-586d2",
  storageBucket: "dabubble-586d2.firebasestorage.app",
  messagingSenderId: "155220965649",
  appId: "1:155220965649:web:5f87c097ce167fbcc4b4b0",
  measurementId: "G-4KEKXPJ8CK"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);