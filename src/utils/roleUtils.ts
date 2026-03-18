/* ---------------- ROLE CONSTANTS ---------------- */

export const ROLES = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  EDITOR: "editor",
  VIEWER: "viewer"
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

/* ---------------- SUPER ADMIN EMAIL ---------------- */

export const SUPER_ADMIN_EMAIL = "arunnanna3@gmail.com"

/* ---------------- CHECK SUPER ADMIN ---------------- */

export const isSuperAdmin = (email?: string | null) => {
  return email === SUPER_ADMIN_EMAIL
}

/* ---------------- ROLE PERMISSIONS ---------------- */

export const canManageAdmins = (role?: string) => {
  return role === ROLES.SUPER_ADMIN
}

export const canApproveAdmins = (role?: string) => {
  return role === ROLES.SUPER_ADMIN
}

export const canEditContent = (role?: string) => {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.EDITOR
  )
}

export const canManageGallery = (role?: string) => {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.EDITOR
  )
}

export const canManageNotices = (role?: string) => {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN
  )
}

export const canViewDashboard = (role?: string) => {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ADMIN ||
    role === ROLES.EDITOR ||
    role === ROLES.VIEWER
  )
}

/* ---------------- PROTECT SUPER ADMIN ---------------- */

export const isProtectedAdmin = (email?: string) => {
  return email === SUPER_ADMIN_EMAIL
}
