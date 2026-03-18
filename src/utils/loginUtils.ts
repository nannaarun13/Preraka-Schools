import { z } from "zod";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

/* =======================
   CONSTANTS
======================= */

export const DEFAULT_ADMIN_EMAIL = "arunnanna3@gmail.com";

/* =======================
   VALIDATION SCHEMAS
======================= */

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/* =======================
   LOGIN HANDLER
======================= */

export const handleLogin = async (
  values: z.infer<typeof loginSchema>
): Promise<User> => {

  const email = values.email.toLowerCase().trim();
  const password = values.password.trim();

  if (!email || !password) {
    throw new Error("Invalid credentials");
  }

  // 🔐 Firebase Authentication
  const credential = await signInWithEmailAndPassword(auth, email, password);

  const user = credential.user;

  if (!user || !user.uid) {
    throw new Error("Authentication failed");
  }

  const adminRef = doc(db, "admins", user.uid);
  let adminSnap = await getDoc(adminRef);

  /* =======================
     AUTO CREATE DEFAULT ADMIN
  ======================= */

  if (!adminSnap.exists()) {

    if (user.email?.toLowerCase() === DEFAULT_ADMIN_EMAIL) {

      await setDoc(adminRef, {
        uid: user.uid,
        email: user.email.toLowerCase(),
        status: "approved",
        role: "super_admin",
        approvedBy: "system",
        approvedAt: new Date().toISOString(),
      });

      adminSnap = await getDoc(adminRef);

    } else {

      await signOut(auth);
      throw new Error("Admin access not granted");

    }
  }

  /* =======================
     ADMIN STATUS CHECK
  ======================= */

  const adminData = adminSnap.data();

  if (!adminData || adminData.status !== "approved") {
    await signOut(auth);
    throw new Error("Admin account not approved");
  }

  return user;
};

/* =======================
   LOGOUT
======================= */

export const handleLogout = async (): Promise<void> => {
  await signOut(auth);
};

/* =======================
   FORGOT PASSWORD
======================= */

export const handleForgotPassword = async (
  values: z.infer<typeof forgotPasswordSchema>
): Promise<void> => {

  const email = values.email.toLowerCase().trim();

  if (!email) {
    throw new Error("Email is required");
  }

  try {

    await sendPasswordResetEmail(auth, email);

  } catch (error: any) {

    if (error.code === "auth/user-not-found") {
      throw new Error("No account found with this email");
    }

    if (error.code === "auth/invalid-email") {
      throw new Error("Invalid email format");
    }

    throw new Error("Failed to send password reset email");
  }
};
