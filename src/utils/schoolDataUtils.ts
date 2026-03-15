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

export const getSchoolData = async (): Promise<SchoolData> => {
  try {
    const docSnap = await getDoc(schoolConfigRef());

    if (docSnap.exists()) {
      const data = { ...defaultSchoolData, ...docSnap.data() } as SchoolData;

      // Avoid storing huge objects in localStorage
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

    const cachedData = localStorage.getItem("schoolData");
    if (cachedData) {
      try {
        return { ...defaultSchoolData, ...JSON.parse(cachedData) };
      } catch {
        return defaultSchoolData;
      }
    }

    return defaultSchoolData;
  }
};

export const updateSchoolData = async (
  data: Partial<SchoolData>
): Promise<void> => {
  try {
    const safeData = cleanData(data);

    await setDoc(schoolConfigRef(), safeData, { merge: true });

    const currentCache = localStorage.getItem("schoolData");
    const cachedData = currentCache
      ? JSON.parse(currentCache)
      : defaultSchoolData;

    const updatedCache = { ...cachedData, ...safeData };

    localStorage.setItem(
      "schoolData",
      JSON.stringify({
        schoolName: updatedCache.schoolName,
        aboutContent: updatedCache.aboutContent,
        latestUpdates: updatedCache.latestUpdates
      })
    );

    console.log("School data updated successfully");
  } catch (error) {
    console.error("Failed to update school data:", error);
    throw error;
  }
};

export const subscribeToSchoolData = (
  callback: (data: SchoolData) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  return onSnapshot(
    schoolConfigRef(),
    (doc) => {
      if (doc.exists()) {
        const data = { ...defaultSchoolData, ...doc.data() } as SchoolData;

        localStorage.setItem(
          "schoolData",
          JSON.stringify({
            schoolName: data.schoolName,
            aboutContent: data.aboutContent,
            latestUpdates: data.latestUpdates
          })
        );

        callback(data);
      } else {
        console.warn("School config document not found. Using defaults.");
        callback(defaultSchoolData);
      }
    },
    (error) => {
      console.error("Real-time subscription error:", error);

      const cachedData = localStorage.getItem("schoolData");

      if (cachedData) {
        try {
          callback({ ...defaultSchoolData, ...JSON.parse(cachedData) });
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
