import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🔥 Only load in browser
let analytics = null;
let appCheck = null;

const firebaseConfig = {
  apiKey: "AIzaSyDteb7H98-XxmI0rmcFfPR6lqAiwdhy7SU",
  authDomain: "preraka-school.firebaseapp.com",
  projectId: "preraka-school",
  storageBucket: "preraka-school.appspot.com",
  messagingSenderId: "886385961667",
  appId: "1:886385961667:web:a9da80e2af5a7d5e4fd076",
  measurementId: "G-4NB208KDS1"
};

// Init app
const app = initializeApp(firebaseConfig);

// Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// ✅ Safe browser-only loading
if (typeof window !== "undefined") {
  import("firebase/analytics").then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });

  import("firebase/app-check").then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(
        "6LeR5Y4sAAAAAKC7KOQKYaLo1YYmolGwwAAZq2FP"
      ),
      isTokenAutoRefreshEnabled: true
    });
  });
}

export { analytics, appCheck };

export default app;