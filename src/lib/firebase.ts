// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
