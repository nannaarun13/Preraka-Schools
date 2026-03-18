import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  updateDoc,
  doc,
  QueryConstraint,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

/* =======================
   CONSTANTS
======================= */

export const SECURITY_EVENT_TYPES = [
  "login_attempt",
  "admin_registration",
  "permission_denied",
  "rate_limit_exceeded",
  "suspicious_activity",
] as const;

export const SEVERITY_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

/* =======================
   TYPES
======================= */

export interface SecurityEvent {
  id?: string;
  type: typeof SECURITY_EVENT_TYPES[number];
  severity: typeof SEVERITY_LEVELS[number];
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details: string;
  timestamp: string;
  resolved: boolean;
}

/* =======================
   RATE LIMIT
======================= */

let lastLogTime = 0;

const shouldLog = () => {
  const now = Date.now();
  if (now - lastLogTime < 1500) return false;
  lastLogTime = now;
  return true;
};

/* =======================
   SANITIZATION
======================= */

const sanitizeLogInput = (
  input: unknown,
  maxLength = 2000
): string => {

  if (!input || typeof input !== "string") return "unknown";

  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[<>'"&`]/g, "")
    .trim()
    .substring(0, maxLength);

};

/* =======================
   CLIENT INFO
======================= */

const getClientInfo = () => {

  if (typeof window === "undefined") {
    return {
      userAgent: "server",
    };
  }

  return {
    userAgent: sanitizeLogInput(navigator.userAgent, 500),
  };

};

/* =======================
   LOG SECURITY EVENT
======================= */

export const logSecurityEvent = async (
  event: Omit<SecurityEvent, "id" | "timestamp" | "resolved">
): Promise<void> => {

  try {

    if (!shouldLog()) return;

    if (!SECURITY_EVENT_TYPES.includes(event.type)) return;
    if (!SEVERITY_LEVELS.includes(event.severity)) return;

    const clientInfo = getClientInfo();

    const payload: SecurityEvent = {

      type: event.type,

      severity: event.severity,

      email: event.email
        ? sanitizeLogInput(event.email, 100)
        : undefined,

      ipAddress: event.ipAddress
        ? sanitizeLogInput(event.ipAddress, 50)
        : undefined,

      userAgent:
        event.userAgent ||
        clientInfo.userAgent,

      details: sanitizeLogInput(event.details, 2000),

      timestamp: new Date().toISOString(),

      resolved: false,

    };

    await addDoc(
      collection(db, "security_events"),
      payload
    );

  } catch (error) {

    console.error("Error logging security event:", error);

  }

};

/* =======================
   FETCH SECURITY EVENTS
======================= */

export const getSecurityEvents = async (
  limitCount = 50,
  severity?: typeof SEVERITY_LEVELS[number],
  type?: typeof SECURITY_EVENT_TYPES[number]
): Promise<SecurityEvent[]> => {

  try {

    const safeLimit = Math.min(Math.max(limitCount, 1), 100);

    const constraints: QueryConstraint[] = [
      orderBy("timestamp", "desc"),
      limit(safeLimit),
    ];

    if (severity) {
      constraints.push(where("severity", "==", severity));
    }

    if (type) {
      constraints.push(where("type", "==", type));
    }

    const q = query(
      collection(db, "security_events"),
      ...constraints
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as SecurityEvent),
    }));

  } catch (error) {

    console.error("Failed to fetch security events:", error);

    return [];

  }

};

/* =======================
   RESOLVE SECURITY EVENT
======================= */

export const resolveSecurityEvent = async (
  eventId: string
): Promise<void> => {

  try {

    await updateDoc(
      doc(db, "security_events", eventId),
      {
        resolved: true,
      }
    );

  } catch (error) {

    console.error("Failed to resolve event:", error);

  }

};
