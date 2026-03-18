import { getSecurityClientInfo } from "./securityClientInfo";
import { SECURITY_EVENTS, SecurityEventType } from "./securityConfig";
import { db } from "@/lib/firebase";

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp
} from "firebase/firestore";

/* =======================
   TYPES
======================= */

export interface SecurityEvent {
  id?: string;
  type: SecurityEventType;
  adminId?: string;
  email: string;
  timestamp: string;
  severity: "low" | "medium" | "high" | "critical";
  details: Record<string, any>;
  resolved: boolean;
}

/* =======================
   CLASS
======================= */

export class AdvancedSecurityMonitor {

  private readonly LOCATION_CHANGE_THRESHOLD = 2;
  private readonly BRUTE_FORCE_THRESHOLD = 3;
  private readonly BRUTE_FORCE_WINDOW_MINUTES = 10;

  /* =======================
     LOGIN ANALYSIS
  ======================= */

  async analyzeLoginAttempt(
    email: string,
    success: boolean,
    userId?: string
  ): Promise<void> {

    try {

      if (typeof window === "undefined") return;

      const clientInfo = await getSecurityClientInfo();

      await this.logLoginActivity(email, success, userId, clientInfo);

      await this.analyzeLoginPattern(email);

      if (success && userId && clientInfo?.fingerprint) {

        await this.analyzeDeviceFingerprint(
          userId,
          email,
          clientInfo.fingerprint
        );

        if (clientInfo.fingerprint.timezone) {
          await this.analyzeGeographicLocation(
            userId,
            email,
            clientInfo.fingerprint.timezone
          );
        }
      }

    } catch (error) {
      console.error("Security analysis failed:", error);
    }
  }

  /* =======================
     METRICS
  ======================= */

  async getSecurityMetrics() {

    try {

      const since = new Date();
      since.setHours(since.getHours() - 24);

      const q = query(
        collection(db, "security_events"),
        where("timestamp", ">=", since.toISOString()),
        orderBy("timestamp", "desc")
      );

      const snapshot = await getDocs(q);

      const events = snapshot.docs.map(d => d.data());

      const metrics = {
        totalEvents: events.length,
        criticalEvents: events.filter(e => e.severity === "critical").length,
        highSeverityEvents: events.filter(e => e.severity === "high").length,
        unresolvedEvents: events.filter(e => !e.resolved).length,
        eventsByType: {} as Record<string, number>,
        last24Hours: events
      };

      for (const event of events) {
        metrics.eventsByType[event.type] =
          (metrics.eventsByType[event.type] || 0) + 1;
      }

      return metrics;

    } catch (error) {

      console.error("Failed to load security metrics:", error);

      return {
        totalEvents: 0,
        criticalEvents: 0,
        highSeverityEvents: 0,
        unresolvedEvents: 0,
        eventsByType: {},
        last24Hours: []
      };
    }
  }

  /* =======================
     LOGIN ACTIVITY LOG
  ======================= */

  private async logLoginActivity(
    email: string,
    success: boolean,
    userId: string | undefined,
    clientInfo: any
  ): Promise<void> {

    await addDoc(collection(db, "admin_login_activities"), {

      email,
      adminId: userId || null,
      status: success ? "success" : "failed",
      loginTime: new Date().toISOString(),

      ip: clientInfo?.ipAddress || "unknown",

      userAgent: clientInfo?.fingerprint?.userAgent || "unknown",

      timezone: clientInfo?.fingerprint?.timezone || null

    });
  }

  /* =======================
     BRUTE FORCE DETECTION
  ======================= */

  private async analyzeLoginPattern(email: string): Promise<void> {

    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - this.BRUTE_FORCE_WINDOW_MINUTES);

    const q = query(
      collection(db, "admin_login_activities"),
      where("email", "==", email),
      where("loginTime", ">=", windowStart.toISOString()),
      orderBy("loginTime", "desc"),
      limit(10)
    );

    const snapshot = await getDocs(q);

    const failures = snapshot.docs.filter(
      d => d.data().status === "failed"
    );

    if (failures.length >= this.BRUTE_FORCE_THRESHOLD) {

      await this.recordSecurityEvent({
        type: SECURITY_EVENTS.BRUTE_FORCE,
        email,
        severity: "high",
        details: {
          attempts: failures.length,
          windowMinutes: this.BRUTE_FORCE_WINDOW_MINUTES
        }
      });

    }
  }

  /* =======================
     DEVICE FINGERPRINT
  ======================= */

  private async analyzeDeviceFingerprint(
    adminId: string,
    email: string,
    fingerprint: any
  ): Promise<void> {

    if (!fingerprint?.userAgent) return;

    const q = query(
      collection(db, "device_profiles"),
      where("adminId", "==", adminId),
      where("fingerprint", "==", fingerprint.userAgent),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {

      /* SAVE DEVICE */

      await addDoc(collection(db, "device_profiles"), {
        adminId,
        fingerprint: fingerprint.userAgent,
        createdAt: new Date().toISOString()
      });

      /* RECORD EVENT */

      await this.recordSecurityEvent({
        type: SECURITY_EVENTS.NEW_DEVICE,
        email,
        adminId,
        severity: "medium",
        details: { fingerprint }
      });
    }
  }

  /* =======================
     LOCATION CHANGE
  ======================= */

  private async analyzeGeographicLocation(
    adminId: string,
    email: string,
    timezone: string
  ): Promise<void> {

    const q = query(
      collection(db, "admin_login_activities"),
      where("adminId", "==", adminId),
      orderBy("loginTime", "desc"),
      limit(this.LOCATION_CHANGE_THRESHOLD)
    );

    const snapshot = await getDocs(q);

    const previousTimezones = snapshot.docs
      .map(d => d.data().timezone)
      .filter(Boolean);

    if (
      previousTimezones.length >= this.LOCATION_CHANGE_THRESHOLD &&
      !previousTimezones.includes(timezone)
    ) {

      await this.recordSecurityEvent({
        type: SECURITY_EVENTS.LOCATION_CHANGE,
        email,
        adminId,
        severity: "medium",
        details: { timezone }
      });
    }
  }

  /* =======================
     RECORD SECURITY EVENT
  ======================= */

  private async recordSecurityEvent(
    event: Omit<SecurityEvent, "id" | "timestamp" | "resolved">
  ): Promise<void> {

    await addDoc(collection(db, "security_events"), {
      ...event,
      timestamp: new Date().toISOString(),
      resolved: false
    });

    if (event.severity === "critical") {
      console.warn("🚨 CRITICAL SECURITY EVENT:", event);
    }
  }
}

/* =======================
   SINGLETON EXPORT
======================= */

export const advancedSecurityMonitor = new AdvancedSecurityMonitor();
