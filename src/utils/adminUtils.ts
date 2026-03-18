import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* =========================
   SUPER ADMIN CONFIG
========================= */

const DEFAULT_ADMIN_EMAIL = "arunnanna3@gmail.com";

/* =========================
   ADMIN TYPES
========================= */

export interface AdminRecord {
  uid: string;
  email: string;
  role: "super_admin" | "admin";
  status: "approved" | "pending" | "rejected";
  firstName?: string;
  lastName?: string;
  phone?: string;
  requestedAt?: any;
  approvedAt?: any;
  approvedBy?: string;
}

/* =========================
   ENSURE SUPER ADMIN
========================= */

export const ensureDefaultAdmin = async (
  uid: string,
  email?: string | null
): Promise<void> => {
  if (!uid || !email) return;

  try {
    const adminRef = doc(db, "admins", uid);
    const snapshot = await getDoc(adminRef);

    if (snapshot.exists()) return;

    const normalizedEmail = email.toLowerCase();

    if (normalizedEmail !== DEFAULT_ADMIN_EMAIL) {
      console.warn("Unauthorized admin creation attempt");
      return;
    }

    await setDoc(adminRef, {
      uid,
      email: normalizedEmail,
      role: "super_admin",
      status: "approved",
      createdAt: serverTimestamp(),
      approvedAt: serverTimestamp(),
      approvedBy: "system",
    });

    console.info("Super admin initialized");
  } catch (error) {
    console.error("Failed to create super admin:", error);
  }
};

/* =========================
   CHECK IF USER IS ADMIN
========================= */

export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const adminRef = doc(db, "admins", uid);
    const snapshot = await getDoc(adminRef);

    if (!snapshot.exists()) return false;

    const data = snapshot.data() as AdminRecord;

    return data.status === "approved";
  } catch (error) {
    console.error("Admin check failed:", error);
    return false;
  }
};

/* =========================
   GET ADMIN ROLE
========================= */

export const getAdminRole = async (
  uid: string
): Promise<"super_admin" | "admin" | null> => {
  try {
    const adminRef = doc(db, "admins", uid);
    const snapshot = await getDoc(adminRef);

    if (!snapshot.exists()) return null;

    const data = snapshot.data() as AdminRecord;

    if (data.status !== "approved") return null;

    return data.role;
  } catch (error) {
    console.error("Failed to get admin role:", error);
    return null;
  }
};

/* =========================
   REQUEST ADMIN ACCESS
========================= */

export const requestAdminAccess = async (
  uid: string,
  email: string,
  firstName: string,
  lastName: string,
  phone: string
): Promise<void> => {
  try {
    const adminRef = doc(db, "admins", uid);

    await setDoc(adminRef, {
      uid,
      email,
      firstName,
      lastName,
      phone,
      role: "admin",
      status: "pending",
      requestedAt: serverTimestamp(),
    });

    console.info("Admin access request submitted");
  } catch (error) {
    console.error("Failed to request admin access:", error);
  }
};

/* =========================
   APPROVE ADMIN (SUPER ADMIN)
========================= */

export const approveAdmin = async (
  uid: string,
  approvedBy: string
): Promise<void> => {
  try {
    const adminRef = doc(db, "admins", uid);

    await updateDoc(adminRef, {
      status: "approved",
      approvedAt: serverTimestamp(),
      approvedBy,
    });

    console.info("Admin approved");
  } catch (error) {
    console.error("Failed to approve admin:", error);
  }
};

/* =========================
   REJECT ADMIN
========================= */

export const rejectAdmin = async (uid: string): Promise<void> => {
  try {
    const adminRef = doc(db, "admins", uid);

    await updateDoc(adminRef, {
      status: "rejected",
    });

    console.info("Admin rejected");
  } catch (error) {
    console.error("Failed to reject admin:", error);
  }
};
