import { useState, useEffect, useCallback, useRef } from "react"
import {
  CheckCircle,
  CloudOff,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react"

import { processPendingUpdates } from "@/utils/schoolDataUtils"

const SyncStatusIndicator = () => {

  const [syncStatus, setSyncStatus] = useState<
    "synced" | "syncing" | "offline" | "pending" | "error"
  >("synced")

  const [pendingCount, setPendingCount] = useState(0)

  const syncingRef = useRef(false)

  /* SAFE JSON PARSE */

  const getPendingUpdates = () => {
    try {
      const raw = localStorage.getItem("pendingUpdates")
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  /* MAIN SYNC CHECK */

  const checkPendingUpdates = useCallback(async () => {

    if (syncingRef.current) return

    const pending = getPendingUpdates()

    setPendingCount(pending.length)

    if (!navigator.onLine) {
      setSyncStatus("offline")
      return
    }

    if (pending.length === 0) {
      setSyncStatus("synced")
      return
    }

    try {

      syncingRef.current = true
      setSyncStatus("syncing")

      await processPendingUpdates()

      setSyncStatus("synced")
      setPendingCount(0)

    } catch (error) {

      console.error("Sync failed:", error)
      setSyncStatus("error")

    } finally {

      syncingRef.current = false

    }

  }, [])

  /* EFFECTS */

  useEffect(() => {

    checkPendingUpdates()

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pendingUpdates") {
        checkPendingUpdates()
      }
    }

    const handleOnline = () => {
      console.log("Network restored, syncing...")
      checkPendingUpdates()
    }

    const handleOffline = () => {
      setSyncStatus("offline")
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    const interval = setInterval(checkPendingUpdates, 10000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }

  }, [checkPendingUpdates])

  /* MANUAL SYNC */

  const handleManualSync = () => {
    if (navigator.onLine) {
      checkPendingUpdates()
    }
  }

  /* STATUS CONFIG */

  const getStatusInfo = () => {

    switch (syncStatus) {

      case "synced":
        return {
          icon: CheckCircle,
          text: "Saved",
          color: "text-green-600",
          bg: "bg-green-50",
          spin: false
        }

      case "syncing":
        return {
          icon: Loader2,
          text: "Syncing...",
          color: "text-blue-600",
          bg: "bg-blue-50",
          spin: true
        }

      case "offline":
        return {
          icon: CloudOff,
          text: pendingCount
            ? `${pendingCount} changes queued`
            : "Offline",
          color: "text-gray-600",
          bg: "bg-gray-100",
          spin: false
        }

      case "pending":
        return {
          icon: RefreshCw,
          text: `${pendingCount} unsaved changes`,
          color: "text-orange-600",
          bg: "bg-orange-50",
          spin: false
        }

      case "error":
        return {
          icon: AlertCircle,
          text: "Sync Failed (Click to retry)",
          color: "text-red-600",
          bg: "bg-red-50",
          spin: false,
          clickable: true
        }

      default:
        return {
          icon: CheckCircle,
          text: "Unknown",
          color: "text-gray-500",
          bg: "bg-gray-50",
          spin: false
        }

    }

  }

  const { icon: Icon, text, color, bg, spin, clickable } = getStatusInfo()

  return (

    <div
      onClick={clickable ? handleManualSync : undefined}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${color} ${bg} ${
        clickable
          ? "cursor-pointer hover:opacity-80 active:scale-95"
          : ""
      }`}
      title={clickable ? "Click to retry sync" : ""}
    >

      <Icon className={`h-3.5 w-3.5 ${spin ? "animate-spin" : ""}`} />

      <span>{text}</span>

    </div>

  )

}

export default SyncStatusIndicator
