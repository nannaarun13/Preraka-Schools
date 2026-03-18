import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

const SCHOOL_DOC = doc(db, "school", "config")

/* ---------------- CREATE BACKUP ---------------- */

export const createBackup = async () => {

  try {

    const snap = await getDoc(SCHOOL_DOC)

    if (!snap.exists()) return

    const data = snap.data()

    await addDoc(
      collection(db, "school_backups"),
      {
        data,
        createdAt: new Date().toISOString()
      }
    )

    console.log("Backup created successfully")

    await cleanupOldBackups()

  } catch (error) {

    console.error("Backup failed:", error)

  }

}

/* ---------------- CLEAN OLD BACKUPS ---------------- */

export const cleanupOldBackups = async () => {

  const snap = await getDocs(collection(db, "school_backups"))

  const backups = snap.docs

  if (backups.length <= 30) return

  const sorted = backups.sort(
    (a, b) =>
      new Date(a.data().createdAt).getTime() -
      new Date(b.data().createdAt).getTime()
  )

  const toDelete = sorted.slice(0, backups.length - 30)

  for (const docItem of toDelete) {

    await deleteDoc(docItem.ref)

  }

}

/* ---------------- AUTO BACKUP ---------------- */

export const startAutoBackup = () => {

  createBackup()

  setInterval(() => {

    createBackup()

  }, 24 * 60 * 60 * 1000)

}
