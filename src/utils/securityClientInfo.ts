interface ClientFingerprint {
  userAgent: string
  screen: string
  timezone: string
  language: string
  platform: string
  cookieEnabled: boolean
  doNotTrack: string
  hardwareConcurrency: number
}

export interface SecurityClientInfo {
  fingerprint: ClientFingerprint
  ipAddress: string
  timestamp: string
  sessionId: string
}

/* --------------------
   SAFE CHECK
-------------------- */

const isBrowser = () =>
  typeof window !== "undefined"

/* --------------------
   SANITIZE
-------------------- */

const sanitizeClientData = (
  data: unknown,
  maxLength = 200
): string => {

  if (!data || typeof data !== "string") return "unknown"

  return data
    .replace(/[<>'"&`]/g, "")
    .trim()
    .substring(0, maxLength)
}

/* --------------------
   PUBLIC IP (WITH CACHE)
-------------------- */

let cachedIP: string | null = null

const getPublicIP = async (): Promise<string> => {

  if (cachedIP) return cachedIP

  try {

    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      3000
    )

    const response = await fetch(
      "https://api.ipify.org?format=json",
      { signal: controller.signal }
    )

    clearTimeout(timeout)

    if (response.ok) {

      const data = await response.json()

      cachedIP = sanitizeClientData(data.ip, 50)

      return cachedIP
    }

  } catch {
    // ignore network errors
  }

  return "unknown"
}

/* --------------------
   CLIENT FINGERPRINT
-------------------- */

export const generateClientFingerprint = (): ClientFingerprint => {

  if (!isBrowser()) {

    return {
      userAgent: "server",
      screen: "unknown",
      timezone: "unknown",
      language: "unknown",
      platform: "server",
      cookieEnabled: false,
      doNotTrack: "unknown",
      hardwareConcurrency: 0
    }

  }

  try {

    const nav = navigator as any

    return {

      userAgent: sanitizeClientData(nav.userAgent, 500),

      screen: window.screen
        ? `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`
        : "unknown",

      timezone:
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",

      language: sanitizeClientData(nav.language || "unknown"),

      platform: sanitizeClientData(
        nav.platform ||
        nav.userAgentData?.platform ||
        "unknown"
      ),

      cookieEnabled: Boolean(nav.cookieEnabled),

      doNotTrack: sanitizeClientData(nav.doNotTrack || "unknown"),

      hardwareConcurrency:
        nav.hardwareConcurrency || 0

    }

  } catch {

    return {
      userAgent: "unknown",
      screen: "unknown",
      timezone: "unknown",
      language: "unknown",
      platform: "unknown",
      cookieEnabled: false,
      doNotTrack: "unknown",
      hardwareConcurrency: 0
    }

  }

}

/* --------------------
   SESSION ID
-------------------- */

const generateSessionId = (): string => {

  const timestamp = Date.now().toString(36)

  if (!isBrowser()) {
    return `server_${timestamp}`
  }

  try {

    const randomPart =
      window.crypto?.getRandomValues
        ? window.crypto
            .getRandomValues(new Uint32Array(1))[0]
            .toString(36)
        : Math.random().toString(36).substring(2)

    return `${timestamp}_${randomPart}`

  } catch {

    return `${timestamp}_${Math.random()
      .toString(36)
      .substring(2)}`

  }

}

/* --------------------
   MAIN CLIENT INFO
-------------------- */

export const getSecurityClientInfo =
  async (): Promise<SecurityClientInfo> => {

    const fingerprint = generateClientFingerprint()

    if (!isBrowser()) {

      return {
        fingerprint,
        ipAddress: "server",
        timestamp: new Date().toISOString(),
        sessionId: generateSessionId()
      }

    }

    const ip = await getPublicIP()

    return {
      fingerprint,
      ipAddress: ip,
      timestamp: new Date().toISOString(),
      sessionId: generateSessionId()
    }

  }

/* --------------------
   ANOMALY DETECTION
-------------------- */

export const detectAnomalies = (
  currentInfo: SecurityClientInfo,
  historicalInfo?: SecurityClientInfo[]
): string[] => {

  const anomalies: string[] = []

  if (!historicalInfo || historicalInfo.length === 0) {
    return anomalies
  }

  const lastKnown = historicalInfo[0]

  if (
    lastKnown.fingerprint.timezone !==
    currentInfo.fingerprint.timezone
  ) {
    anomalies.push("Timezone changed")
  }

  if (
    lastKnown.fingerprint.platform !==
    currentInfo.fingerprint.platform
  ) {
    anomalies.push("Platform changed")
  }

  if (
    lastKnown.fingerprint.userAgent !==
    currentInfo.fingerprint.userAgent
  ) {
    anomalies.push("User agent changed")
  }

  return anomalies

}
