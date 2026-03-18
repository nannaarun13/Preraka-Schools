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

/* ---------------- SAFE STORAGE ---------------- */

const isBrowser = () =>
  typeof window !== "undefined"

/* ---------------- CLEAN DATA ---------------- */

const cleanData = (data: Partial<SchoolData>) => {

  const cleaned: Partial<SchoolData> = {}

  Object.keys(data).forEach((key) => {

    const value = (data as any)[key]

    if (value !== undefined) {
      (cleaned as any)[key] = value
    }

  })

  return cleaned

}

/* ---------------- CACHE SAVE ---------------- */

const saveCache = (data: SchoolData) => {

  if (!isBrowser()) return

  try {

    localStorage.setItem(
      "schoolData",
      JSON.stringify(data)
    )

  } catch (error) {
    console.warn("Cache save failed:", error)
  }

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

    if (isBrowser()) {

      const cached = safeParse(
        localStorage.getItem("schoolData")
      )

      if (cached) {
        return {
          ...defaultSchoolData,
          ...cached
        }
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
        key =>
          JSON.stringify(current[key]) !==
          JSON.stringify((safeData as any)[key])
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

    if (!isBrowser()) throw error

    const pending =
      safeParse(localStorage.getItem("pendingUpdates")) || []

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

  if (!isBrowser() || !navigator.onLine) return

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

      if (json === lastSnapshot) return

      lastSnapshot = json

      saveCache(data)

      callback(data)

    },

    (error) => {

      console.error("Realtime error:", error)

      if (isBrowser()) {

        const cached = safeParse(
          localStorage.getItem("schoolData")
        )

        if (cached) {

          callback({
            ...defaultSchoolData,
            ...cached
          })

          return
        }

      }

      callback(defaultSchoolData)

      if (onError) onError(error)

    }

  )

}
