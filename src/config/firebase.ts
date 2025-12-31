import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// เอาค่าจากหน้าเว็บ Firebase มาใส่ตรงนี้
const firebaseConfig = {
  apiKey: "AIzaSyAErGbCDFd7lEflS0WwWVUB4Q-nymw3yMM",
  authDomain: "commonity-project.firebaseapp.com",
  projectId: "commonity-project",
  storageBucket: "commonity-project.firebasestorage.app",
  messagingSenderId: "1018581026906",
  appId: "1:1018581026906:web:7b2aa2cd97783265c1f063",
  measurementId: "G-L0FGFWY8WS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);