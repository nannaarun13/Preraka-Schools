import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/firebase"
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth"

const ForgotPasswordOTP = () => {

  const [phone,setPhone] = useState("")
  const [otp,setOtp] = useState("")
  const [confirmation,setConfirmation] = useState<any>(null)
  const [verified,setVerified] = useState(false)

  const sendOTP = async () => {

    const verifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size:"invisible" },
      auth
    )

    const result = await signInWithPhoneNumber(
      auth,
      phone,
      verifier
    )

    setConfirmation(result)
  }

  const verifyOTP = async () => {

    await confirmation.confirm(otp)

    setVerified(true)
  }

  return (

    <div className="space-y-4">

      {!confirmation && (
        <>
          <Input
            placeholder="Enter phone number"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
          />

          <Button onClick={sendOTP}>
            Send OTP
          </Button>
        </>
      )}

      {confirmation && !verified && (
        <>
          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e)=>setOtp(e.target.value)}
          />

          <Button onClick={verifyOTP}>
            Verify OTP
          </Button>
        </>
      )}

      {verified && (
        <p className="text-green-600">
          Phone verified ✔
        </p>
      )}

      <div id="recaptcha-container"></div>

    </div>

  )
}

export default ForgotPasswordOTP
