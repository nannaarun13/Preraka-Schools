import * as z from "zod"

/* ---------------- REGISTRATION SCHEMA ---------------- */

export const registrationSchema = z.object({

  firstName: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(50, "First name is too long."),

  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(50, "Last name is too long."),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address."),

  phone: z
    .string()
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10 digit Indian mobile number."
    ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(50, "Password is too long.")
    .regex(
      /^(?=.*[a-z])/,
      "Password must contain at least one lowercase letter."
    )
    .regex(
      /^(?=.*[A-Z])/,
      "Password must contain at least one uppercase letter."
    )
    .regex(
      /^(?=.*\d)/,
      "Password must contain at least one number."
    )
    .regex(
      /^(?=.*[@$!%*?&])/,
      "Password must contain at least one special character."
    ),

  confirmPassword: z.string()

})

.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"]
})

/* ---------------- TYPES ---------------- */

export type RegistrationFormData = z.infer<typeof registrationSchema>
