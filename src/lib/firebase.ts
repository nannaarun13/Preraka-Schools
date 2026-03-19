import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check"

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDteb7H98-XxmI0rmcFfPR6lqAiwdhy7SU",
  authDomain: "preraka-school.firebaseapp.com",
  projectId: "preraka-school",
  storageBucket: "preraka-school.appspot.com", // ✅ FIXED
  messagingSenderId: "886385961667",
  appId: "1:886385961667:web:a9da80e2af5a7d5e4fd076",
  measurementId: "G-4NB208KDS1"
}

// 🔹 Init App
const app = initializeApp(firebaseConfig)

// 🔹 Services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// 🔹 Analytics (browser only)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null

// 🔹 App Check (production security)
if (typeof window !== "undefined") {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(
      "6LeR5Y4sAAAAAKC7KOQKYaLo1YYmolGwwAAZq2FP"
    ),
    isTokenAutoRefreshEnabled: true
  })
}

export default app
