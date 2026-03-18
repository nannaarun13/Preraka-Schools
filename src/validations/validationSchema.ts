import * as z from "zod"

/* =========================
   PASSWORD STRENGTH CHECK
========================= */

export const checkPasswordStrength = (password: string) => {

  let score = 0

  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[@$!%*?&]/.test(password)) score++

  if (score <= 2) return "weak"
  if (score <= 4) return "medium"
  return "strong"
}

/* =========================
   REGISTRATION SCHEMA
========================= */

export const registrationSchema = z
  .object({

    firstName: z
      .string()
      .trim()
      .min(1, "First name is required.")
      .max(50, "First name is too long.")
      .regex(
        /^[a-zA-Z\s]+$/,
        "First name must contain only letters."
      ),

    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required.")
      .max(50, "Last name is too long.")
      .regex(
        /^[a-zA-Z\s]+$/,
        "Last name must contain only letters."
      ),

    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Please enter a valid email address."),

    phone: z
      .string()
      .trim()
      .regex(
        /^[6-9]\d{9}$/,
        "Enter a valid 10 digit Indian mobile number."
      ),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .max(50)
      .regex(/(?=.*[a-z])/, "Must contain a lowercase letter.")
      .regex(/(?=.*[A-Z])/, "Must contain an uppercase letter.")
      .regex(/(?=.*\d)/, "Must contain a number.")
      .regex(/(?=.*[@$!%*?&])/, "Must contain a special character."),

    confirmPassword: z.string()

  })

  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"]
    }
  )

/* =========================
   LOGIN SCHEMA
========================= */

export const loginSchema = z.object({

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address."),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")

})

/* =========================
   FORGOT PASSWORD SCHEMA
========================= */

export const forgotPasswordSchema = z.object({

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")

})

/* =========================
   ADMISSION FORM SCHEMA
========================= */

export const admissionSchema = z.object({

  studentName: z
    .string()
    .trim()
    .min(2, "Student name required")
    .max(100),

  parentName: z
    .string()
    .trim()
    .min(2, "Parent name required")
    .max(100),

  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter valid 10 digit phone number"
    ),

  email: z
    .string()
    .trim()
    .email("Invalid email")
    .optional(),

  class: z
    .string()
    .min(1, "Class is required")

})

/* =========================
   GALLERY UPLOAD SCHEMA
========================= */

export const gallerySchema = z.object({

  title: z
    .string()
    .trim()
    .min(2, "Title required")
    .max(200),

  imageUrl: z
    .string()
    .url("Invalid image URL")

})

/* =========================
   NOTICE SCHEMA
========================= */

export const noticeSchema = z.object({

  title: z
    .string()
    .trim()
    .min(5, "Title required")
    .max(200),

  description: z
    .string()
    .trim()
    .min(10, "Description required")
    .max(2000)

})

/* =========================
   TYPES
========================= */

export type RegistrationFormData =
  z.infer<typeof registrationSchema>

export type LoginFormData =
  z.infer<typeof loginSchema>

export type ForgotPasswordFormData =
  z.infer<typeof forgotPasswordSchema>

export type AdmissionFormData =
  z.infer<typeof admissionSchema>

export type GalleryFormData =
  z.infer<typeof gallerySchema>

export type NoticeFormData =
  z.infer<typeof noticeSchema>
