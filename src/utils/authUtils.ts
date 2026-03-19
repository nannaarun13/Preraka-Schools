// src/utils/authUtils.ts

import { z } from "zod";
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteField,
  UpdateData,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

/* =======================
   CONSTANTS
======================= */

export const DEFAULT_ADMIN_EMAIL = "arunnanna3@gmail.com";

/* =======================
   TYPES
======================= */

export interface AdminUser {
  id: string;
  uid: string;
  email: string;
  status: "pending" | "approved" | "rejected" | "revoked";
  approvedAt?: string;
  approvedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  revokedAt?: string;
  revokedBy?: string;
}

/* =======================
   VALIDATION
======================= */

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"), // 🔥 FIXED
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/* =======================
   LOGIN FUNCTION (FIXED)
======================= */

export const handleLogin = async (
  data: LoginFormData
): Promise<User> => {
  try {
    console.log("STEP 1: START LOGIN");

    const email = data.email.trim().toLowerCase();
    const password = data.password;

    // 🔐 Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, email, password);

    console.log("STEP 2: AUTH SUCCESS");

    const user = cred.user;

    // 🔥 SAFE ADMIN CHECK (NO FREEZE)
    const allowed = await ensureAdminAccess(user);

    console.log("STEP 3: ADMIN CHECK:", allowed);

    if (!allowed) {
      await signOut(auth);
      throw new Error("Your account is not approved by admin.");
    }

    return user;

  } catch (error) {
    console.error("LOGIN FAILED:", error);
    throw error; // 🔥 VERY IMPORTANT
  }
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
  data: ForgotPasswordFormData
): Promise<void> => {
  const email = data.email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, email);
};

/* =======================
   SAFE ADMIN CHECK (FIXED)
======================= */

export const ensureAdminAccess = async (
  user: User | null
): Promise<boolean> => {
  if (!user?.uid || !user.email) return false;

  try {
    console.log("CHECKING ADMIN ACCESS...");

    const ref = doc(db, "admins", user.uid);
    const snap = await getDoc(ref);

    // ✅ If exists
    if (snap.exists()) {
      return snap.data()?.status === "approved";
    }

    // 🔥 Auto-create super admin
    if (user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL) {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email.toLowerCase(),
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: "system",
      });
      return true;
    }

    return false;

  } catch (error) {
    console.error("ADMIN CHECK ERROR:", error);

    // 🔥 IMPORTANT: Prevent freeze
    return false;
  }
};

/* =======================
   ADMIN MANAGEMENT
======================= */

export const getAdminRequests = async (): Promise<AdminUser[]> => {
  try {
    const snapshot = await getDocs(collection(db, "admins"));
    return snapshot.docs.map((d) => ({
      id: d.id,
      uid: d.id,
      ...(d.data() as any),
    }));
  } catch (err) {
    console.error("Failed to fetch admins:", err);
    return [];
  }
};

export const updateAdminRequestStatus = async (
  uid: string,
  status: "approved" | "rejected" | "revoked",
  actionBy = "system"
): Promise<void> => {
  const ref = doc(db, "admins", uid);
  const now = new Date().toISOString();

  const updateData: UpdateData<any> = { status };

  if (status === "approved") {
    updateData.approvedAt = now;
    updateData.approvedBy = actionBy;
    updateData.rejectedAt = deleteField();
    updateData.revokedAt = deleteField();
  }

  if (status === "rejected") {
    updateData.rejectedAt = now;
    updateData.rejectedBy = actionBy;
  }

  if (status === "revoked") {
    updateData.revokedAt = now;
    updateData.revokedBy = actionBy;
  }

  await updateDoc(ref, updateData);
};

/* =======================
   ADMIN CHECK (ROUTE)
======================= */

export const isUserAdmin = async (
  uid: string | null | undefined
): Promise<boolean> => {
  if (!uid) return false;

  try {
    const snap = await getDoc(doc(db, "admins", uid));
    return snap.exists() && snap.data()?.status === "approved";
  } catch (error) {
    console.error("isUserAdmin failed:", error);
    return false;
  }
};