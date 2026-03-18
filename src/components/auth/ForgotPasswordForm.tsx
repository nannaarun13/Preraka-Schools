import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

import { handleForgotPassword, forgotPasswordSchema } from "@/utils/authUtils"

import ForgotPasswordOTP from "@/components/auth/ForgotPasswordOTP"

interface ForgotPasswordFormProps {
  onBackToLogin: () => void
}

const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [useOTP, setUseOTP] = useState(false)

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ""
    }
  })

  /* SHOW OTP RESET SCREEN */

  if (useOTP) {

    return (
      <div className="space-y-4">

        <ForgotPasswordOTP />

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setUseOTP(false)}
        >
          <ArrowLeft className="mr-2 h-4 w-4"/>
          Back
        </Button>

      </div>
    )

  }

  /* EMAIL RESET */

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {

    setError(null)

    try {

      await handleForgotPassword(values)

      setSuccess(true)

    } catch (err: any) {

      console.error("Forgot password error:", err)

      if (err?.code === "auth/unauthorized-domain") {

        setError(
          "This domain is not authorized in Firebase Authentication settings."
        )

      } else if (err?.code === "auth/user-not-found") {

        setError("No account found with this email.")

      } else {

        setError("Failed to send reset email. Please try again.")

      }

    }

  }

  /* SUCCESS SCREEN */

  if (success) {

    return (

      <div className="text-center space-y-4 animate-fade-in">

        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-green-500"/>
        </div>

        <h3 className="text-lg font-semibold text-gray-900">
          Check your inbox
        </h3>

        <p className="text-sm text-gray-600">
          Password reset link sent to
          <br/>
          <strong>{form.getValues("email")}</strong>
        </p>

        <Button
          onClick={onBackToLogin}
          className="w-full bg-school-blue hover:bg-school-blue/90"
        >
          Back to Login
        </Button>

      </div>

    )

  }

  /* FORM */

  return (

    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">

        <Label htmlFor="reset-email">
          Email Address
        </Label>

        <Input
          id="reset-email"
          type="email"
          placeholder="Enter your registered email"
          {...form.register("email")}
        />

        {form.formState.errors.email && (
          <p className="text-sm text-red-500">
            {form.formState.errors.email.message}
          </p>
        )}

      </div>

      <Button
        type="submit"
        className="w-full bg-school-orange hover:bg-school-orange/90"
        disabled={form.formState.isSubmitting}
      >

        {form.formState.isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            Sending...
          </>
        ) : (
          "Send Reset Link"
        )}

      </Button>

      {/* NEW OTP OPTION */}

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setUseOTP(true)}
      >
        Reset using Phone OTP
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={onBackToLogin}
      >
        <ArrowLeft className="mr-2 h-4 w-4"/>
        Back to Login
      </Button>

    </form>

  )

}

export default ForgotPasswordForm
