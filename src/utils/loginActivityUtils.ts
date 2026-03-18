import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

/* =======================
   TYPES
======================= */

export interface LoginActivity {
  adminId?: string;
  email: string;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
  status: "success" | "failed";
  failureReason?: string;
}

/* =======================
   HELPERS
======================= */

// Fetch public IP with timeout
const getPublicIP = async (): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch("https://api.ipify.org?format=json", {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      return data.ip;
    }
  } catch {
    // ignore
  }

  return "unknown";
};

// Sanitize generic strings
const sanitizeString = (input: unknown, maxLength = 500): string => {
  if (!input || typeof input !== "string") return "unknown";

  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>'"&`]/g, "")
    .trim()
    .substring(0, maxLength);
};

// Sanitize email
const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== "string") return "";

  const cleaned = email.toLowerCase().trim();

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(cleaned) || cleaned.length > 100) {
    return "";
  }

  return cleaned;
};

// Get client info (SSR safe)
const getSecureClientInfo = async () => {
  try {

    if (typeof window === "undefined") {
      return {
        ipAddress: "server",
        userAgent: "server",
      };
    }

    const userAgent = navigator.userAgent || "unknown";
    const ipAddress = await getPublicIP();

    return {
      ipAddress: sanitizeString(ipAddress, 50),
      userAgent: sanitizeString(userAgent, 500),
    };

  } catch (error) {

    console.error("Error getting client info:", error);

    return {
      ipAddress: "unknown",
      userAgent: "unknown",
    };
  }
};

/* =======================
   RATE LIMIT (CLIENT)
======================= */

let lastLogTime = 0;

const shouldLog = () => {
  const now = Date.now();

  if (now - lastLogTime < 2000) {
    return false;
  }

  lastLogTime = now;
  return true;
};

/* =======================
   LOG SUCCESS LOGIN
======================= */

export const logAdminLogin = async (
  adminId: string,
  email: string
): Promise<void> => {

  try {

    if (!adminId || !shouldLog()) return;

    const sanitizedEmail = sanitizeEmail(email);

    if (!sanitizedEmail) return;

    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.email?.toLowerCase() !== sanitizedEmail) {
      console.warn("Login logging skipped: user mismatch");
      return;
    }

    const clientInfo = await getSecureClientInfo();

    const loginActivity: LoginActivity = {

      adminId: sanitizeString(adminId, 100),
      email: sanitizedEmail,
      loginTime: new Date().toISOString(),

      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,

      status: "success",
    };

    await addDoc(
      collection(db, "admin_login_activities"),
      loginActivity
    );

  } catch (error) {
    console.error("Failed to log admin login:", error);
  }
};

/* =======================
   LOG FAILED LOGIN
======================= */

export const logFailedAdminLogin = async (
  email: string,
  reason: string
): Promise<void> => {

  try {

    if (!shouldLog()) return;

    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedReason = sanitizeString(reason, 300);

    const clientInfo = await getSecureClientInfo();

    const loginActivity: LoginActivity = {

      email: sanitizedEmail || "invalid-email",
      loginTime: new Date().toISOString(),

      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,

      status: "failed",
      failureReason: sanitizedReason,
    };

    await addDoc(
      collection(db, "admin_login_activities"),
      loginActivity
    );

  } catch (error) {
    console.error("Failed to log failed admin login:", error);
  }
};

/* =======================
   FETCH RECENT LOGINS
======================= */

export const getRecentLoginActivities = async (
  limitCount = 10
): Promise<LoginActivity[]> => {

  try {

    const q = query(
      collection(db, "admin_login_activities"),
      orderBy("loginTime", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (doc) => doc.data() as LoginActivity
    );

  } catch (error) {

    console.error("Failed to fetch login activities:", error);

    return [];
  }
};
