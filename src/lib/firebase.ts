// Firebase SDK imports
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnLM2N6dn2RcemYmAhcg4J-1Z6dOYIFCc",
  authDomain: "preraka-schools.firebaseapp.com",
  databaseURL: "https://preraka-schools-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "preraka-schools",
  storageBucket: "preraka-schools.appspot.com",
  messagingSenderId: "311466137615",
  appId: "1:311466137615:web:0014abda8334496f97ab7a",
  measurementId: "G-KT86JCXQN4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Fix for React / Next.js analytics
let analytics:any = null;

isSupported().then((yes) => {
  if (yes) {
    analytics = getAnalytics(app);
  }
});

export { analytics };

export default app;
