import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore"

import { db } from "@/lib/firebase"
import { SchoolData, defaultSchoolData } from "@/contexts/SchoolContext"

/* ---------------- FIRESTORE DOC ---------------- */

const schoolConfigRef = () => doc(db, "school", "config")

/* ---------------- SNAPSHOT CACHE ---------------- */

let lastSnapshot = ""

/* ---------------- SAFE JSON PARSE ---------------- */

const safeParse = (value: string | null) => {

  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }

}

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

/* ---------------- CACHE SAVE ---------------- */

const saveCache = (data: SchoolData) => {

  localStorage.setItem(
    "schoolData",
    JSON.stringify(data)
  )

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

      saveCache(data)

      return data

    }

    return defaultSchoolData

  } catch (error) {

    console.error("Error fetching school data:", error)

    const cached = safeParse(localStorage.getItem("schoolData"))

    if (cached) {
      return {
        ...defaultSchoolData,
        ...cached
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

      const changed = Object.keys(safeData).some(
        key => JSON.stringify(current[key]) !== JSON.stringify(safeData[key])
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

    console.error("Update failed, saving offline:", error)

    const pending = safeParse(
      localStorage.getItem("pendingUpdates")
    ) || []

    /* limit queue size */

    if (pending.length > 50) {
      pending.shift()
    }

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

/* ---------------- PROCESS OFFLINE QUEUE ---------------- */

export const processPendingUpdates = async (): Promise<void> => {

  if (!navigator.onLine) return

  const updates = safeParse(
    localStorage.getItem("pendingUpdates")
  )

  if (!updates || !updates.length) return

  const remaining: any[] = []

  for (const item of updates) {

    try {

      await setDoc(
        schoolConfigRef(),
        cleanData(item.data),
        { merge: true }
      )

    } catch (error) {

      console.error("Retry failed:", error)

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

/* ---------------- REALTIME SUBSCRIBE ---------------- */

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

      /* avoid duplicate UI renders */

      if (json === lastSnapshot) return

      lastSnapshot = json

      saveCache(data)

      callback(data)

    },

    (error) => {

      console.error("Realtime error:", error)

      const cached = safeParse(
        localStorage.getItem("schoolData")
      )

      if (cached) {

        callback({
          ...defaultSchoolData,
          ...cached
        })

      } else {

        callback(defaultSchoolData)

      }

      if (onError) onError(error)

    }

  )

}
