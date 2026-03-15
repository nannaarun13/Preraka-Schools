import { 
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { SchoolData, defaultSchoolData } from "@/contexts/SchoolContext";

const schoolConfigRef = () => doc(db, "school", "config");

// Remove undefined values before sending to Firestore
const cleanData = (data: any) => {
  const cleaned: any = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined) {
      cleaned[key] = data[key];
    }
  });
  return cleaned;
};

// Get school data
export const getSchoolData = async (): Promise<SchoolData> => {
  try {
    const docSnap = await getDoc(schoolConfigRef());

    if (docSnap.exists()) {
      const data = { ...defaultSchoolData, ...docSnap.data() } as SchoolData;

      localStorage.setItem(
        "schoolData",
        JSON.stringify({
          schoolName: data.schoolName,
          aboutContent: data.aboutContent,
          latestUpdates: data.latestUpdates
        })
      );

      return data;
    } else {
      localStorage.setItem("schoolData", JSON.stringify(defaultSchoolData));
      return defaultSchoolData;
    }

  } catch (error) {
    console.error("Error fetching school data:", error);

    const cached = localStorage.getItem("schoolData");

    if (cached) {
      try {
        return { ...defaultSchoolData, ...JSON.parse(cached) };
      } catch {
        return defaultSchoolData;
      }
    }

    return defaultSchoolData;
  }
};

// Update school data
export const updateSchoolData = async (
  data: Partial<SchoolData>
): Promise<void> => {

  const safeData = cleanData(data);

  try {
    await setDoc(schoolConfigRef(), safeData, { merge: true });

    const cache = localStorage.getItem("schoolData");
    const cachedData = cache ? JSON.parse(cache) : defaultSchoolData;

    const updated = { ...cachedData, ...safeData };

    localStorage.setItem(
      "schoolData",
      JSON.stringify({
        schoolName: updated.schoolName,
        aboutContent: updated.aboutContent,
        latestUpdates: updated.latestUpdates
      })
    );

    console.log("School data updated successfully");

  } catch (error) {

    console.error("Update failed, saving to queue:", error);

    const pending = JSON.parse(localStorage.getItem("pendingUpdates") || "[]");

    pending.push({
      data: safeData,
      timestamp: Date.now()
    });

    localStorage.setItem("pendingUpdates", JSON.stringify(pending));

    throw error;
  }
};

// Retry queued updates
export const processPendingUpdates = async (): Promise<void> => {

  const pendingRaw = localStorage.getItem("pendingUpdates");

  if (!pendingRaw) return;

  const updates = JSON.parse(pendingRaw);

  if (!updates.length) return;

  console.log("Processing pending updates:", updates.length);

  const remaining: any[] = [];

  for (const item of updates) {

    try {

      await setDoc(
        schoolConfigRef(),
        cleanData(item.data),
        { merge: true }
      );

      console.log("Pending update synced");

    } catch (error) {

      console.error("Pending update failed:", error);

      remaining.push(item);

    }
  }

  if (remaining.length) {
    localStorage.setItem("pendingUpdates", JSON.stringify(remaining));
  } else {
    localStorage.removeItem("pendingUpdates");
  }
};

// Realtime listener
export const subscribeToSchoolData = (
  callback: (data: SchoolData) => void,
  onError?: (error: Error) => void
): Unsubscribe => {

  return onSnapshot(
    schoolConfigRef(),

    (docSnap) => {

      if (docSnap.exists()) {

        const data = {
          ...defaultSchoolData,
          ...docSnap.data()
        } as SchoolData;

        localStorage.setItem(
          "schoolData",
          JSON.stringify({
            schoolName: data.schoolName,
            aboutContent: data.aboutContent,
            latestUpdates: data.latestUpdates
          })
        );

        callback(data);

        setTimeout(() => {
          processPendingUpdates().catch(console.error);
        }, 2000);

      } else {

        console.warn("School config document not found. Using defaults.");

        callback(defaultSchoolData);
      }
    },

    (error) => {

      console.error("Realtime subscription error:", error);

      const cached = localStorage.getItem("schoolData");

      if (cached) {

        try {
          callback({
            ...defaultSchoolData,
            ...JSON.parse(cached)
          });

        } catch {
          callback(defaultSchoolData);
        }

      } else {
        callback(defaultSchoolData);
      }

      if (onError) onError(error);
    }
  );
};
