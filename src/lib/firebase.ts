import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDteb7H98-XxmI0rmcFfPR6lqAiwdhy7SU",
  authDomain: "preraka-school.firebaseapp.com",
  projectId: "preraka-school",
  storageBucket: "preraka-school.firebasestorage.app",
  messagingSenderId: "886385961667",
  appId: "1:886385961667:web:a9da80e2af5a7d5e4fd076",
  measurementId: "G-4NB208KDS1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Cloud Firestore and export it as 'db'
export const db = getFirestore(app);
