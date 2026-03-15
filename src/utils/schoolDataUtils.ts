import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import { SchoolData, defaultSchoolData } from "@/contexts/SchoolContext"

/* ---------------- DOC REF ---------------- */

const schoolConfigRef = () => doc(db, "school", "config")

/* ---------------- CACHE FOR SNAPSHOT ---------------- */

let lastSnapshot = ""

/* ---------------- CLEAN DATA ---------------- */

const cleanData = (data: any) => {

  const cleaned: any = {}

  Object.keys(data).forEach((key) => {

    if (data[key] !== undefined) {
      cleaned[key] = data[key]
    }

  })

  return cleaned
}

/* ---------------- GET SCHOOL DATA ---------------- */

export const getSchoolData = async (): Promise<SchoolData> => {

  try {

    const docSnap = await getDoc(schoolConfigRef())

    if (docSnap.exists()) {

      const data = {
        ...defaultSchoolData,
        ...docSnap.data()
      } as SchoolData

      localStorage.setItem(
        "schoolData",
        JSON.stringify({
          schoolName: data.schoolName
        })
      )

      return data
    }

    return defaultSchoolData

  } catch (error) {

    console.error("Error fetching school data:", error)

    const cached = localStorage.getItem("schoolData")

    if (cached) {

      try {

        return {
          ...defaultSchoolData,
          ...JSON.parse(cached)
        }

      } catch {

        return defaultSchoolData
      }
    }

    return defaultSchoolData
  }
}

/* ---------------- UPDATE SCHOOL DATA ---------------- */

export const updateSchoolData = async (
  data: Partial<SchoolData>
): Promise<void> => {

  const safeData = cleanData(data)

  try {

    const snap = await getDoc(schoolConfigRef())

    if (snap.exists()) {

      const current = snap.data()

      /* check if actual change exists */

      const changed = Object.keys(safeData).some(
        key => current[key] !== safeData[key]
      )

      if (!changed) {

        console.log("No changes detected. Skipping update.")

        return
      }
    }

    await setDoc(
      schoolConfigRef(),
      safeData,
      { merge: true }
    )

    console.log("Firestore update successful")

  } catch (error) {

    console.error("Update failed, saving to queue:", error)

    const pending = JSON.parse(
      localStorage.getItem("pendingUpdates") || "[]"
    )

    pending.push({
      data: safeData,
      timestamp: Date.now()
    })

    localStorage.setItem(
      "pendingUpdates",
      JSON.stringify(pending)
    )

    throw error
  }
}

/* ---------------- PROCESS OFFLINE UPDATES ---------------- */

export const processPendingUpdates = async (): Promise<void> => {

  const pendingRaw = localStorage.getItem("pendingUpdates")

  if (!pendingRaw) return

  const updates = JSON.parse(pendingRaw)

  if (!updates.length) return

  const remaining: any[] = []

  for (const item of updates) {

    try {

      await setDoc(
        schoolConfigRef(),
        cleanData(item.data),
        { merge: true }
      )

    } catch (error) {

      remaining.push(item)

    }

  }

  if (remaining.length) {

    localStorage.setItem(
      "pendingUpdates",
      JSON.stringify(remaining)
    )

  } else {

    localStorage.removeItem("pendingUpdates")

  }

}

/* ---------------- REALTIME LISTENER ---------------- */

export const subscribeToSchoolData = (
  callback: (data: SchoolData) => void,
  onError?: (error: Error) => void
): Unsubscribe => {

  return onSnapshot(
    schoolConfigRef(),

    (docSnap) => {

      if (!docSnap.exists()) {

        callback(defaultSchoolData)

        return
      }

      const data = {
        ...defaultSchoolData,
        ...docSnap.data()
      } as SchoolData

      const json = JSON.stringify(data)

      /* prevent duplicate UI updates */

      if (json === lastSnapshot) return

      lastSnapshot = json

      localStorage.setItem(
        "schoolData",
        JSON.stringify({
          schoolName: data.schoolName
        })
      )

      callback(data)

    },

    (error) => {

      console.error("Realtime subscription error:", error)

      const cached = localStorage.getItem("schoolData")

      if (cached) {

        try {

          callback({
            ...defaultSchoolData,
            ...JSON.parse(cached)
          })

        } catch {

          callback(defaultSchoolData)
        }

      } else {

        callback(defaultSchoolData)

      }

      if (onError) onError(error)

    }
  )
}
```
