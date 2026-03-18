import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc
} from "firebase/firestore"

import { db } from "@/lib/firebase"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"

import {
  Download,
  Trash2,
  RotateCcw,
  Database
} from "lucide-react"

import { createBackup } from "@/utils/backupUtils"

interface Backup {
  id: string
  data: any
  createdAt: string
}

const BackupManager = () => {

  const [backups, setBackups] = useState<Backup[]>([])
  const [loading, setLoading] = useState(true)

  /* ---------------- LOAD BACKUPS ---------------- */

  const loadBackups = async () => {

    const snap = await getDocs(collection(db, "school_backups"))

    const list: Backup[] = []

    snap.forEach(docItem => {

      list.push({
        id: docItem.id,
        ...docItem.data()
      } as Backup)

    })

    list.sort(
      (a,b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )

    setBackups(list)
    setLoading(false)

  }

  useEffect(() => {

    loadBackups()

  }, [])

  /* ---------------- RESTORE ---------------- */

  const restoreBackup = async (backup: Backup) => {

    const confirmRestore = confirm(
      "Restore this backup? Current data will be replaced."
    )

    if (!confirmRestore) return

    await setDoc(
      doc(db,"school","config"),
      backup.data
    )

    alert("Backup restored successfully")

  }

  /* ---------------- DELETE ---------------- */

  const deleteBackup = async (id: string) => {

    const confirmDelete = confirm("Delete this backup?")

    if (!confirmDelete) return

    await deleteDoc(
      doc(db,"school_backups",id)
    )

    loadBackups()

  }

  /* ---------------- DOWNLOAD ---------------- */

  const downloadBackup = (backup: Backup) => {

    const blob = new Blob(
      [JSON.stringify(backup.data,null,2)],
      { type:"application/json" }
    )

    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")

    a.href = url
    a.download = `school-backup-${backup.createdAt}.json`

    a.click()

    URL.revokeObjectURL(url)

  }

  /* ---------------- CREATE MANUAL ---------------- */

  const handleCreateBackup = async () => {

    await createBackup()

    alert("Backup created successfully")

    loadBackups()

  }

  /* ---------------- UI ---------------- */

  return (

    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <h2 className="text-2xl font-bold">
          School Data Backups
        </h2>

        <Button onClick={handleCreateBackup}>
          <Database className="h-4 w-4 mr-2"/>
          Create Backup
        </Button>

      </div>

      <Card>

        <CardHeader>

          <CardTitle>
            Available Backups
          </CardTitle>

        </CardHeader>

        <CardContent>

          {loading ? (

            <p>Loading backups...</p>

          ) : backups.length === 0 ? (

            <p>No backups found.</p>

          ) : (

            <div className="space-y-4">

              {backups.map((backup) => (

                <div
                  key={backup.id}
                  className="flex items-center justify-between border p-3 rounded-lg"
                >

                  <div>

                    <p className="font-medium">
                      Backup
                    </p>

                    <p className="text-sm text-gray-500">
                      {new Date(backup.createdAt).toLocaleString()}
                    </p>

                  </div>

                  <div className="flex gap-2">

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadBackup(backup)}
                    >
                      <Download className="h-4 w-4"/>
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreBackup(backup)}
                    >
                      <RotateCcw className="h-4 w-4"/>
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteBackup(backup.id)}
                    >
                      <Trash2 className="h-4 w-4"/>
                    </Button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </CardContent>

      </Card>

    </div>

  )

}

export default BackupManager
