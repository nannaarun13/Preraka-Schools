import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { auth } from "@/lib/firebase"

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updatePassword
} from "firebase/auth"

const ForgotPasswordOTP = () => {

  const [phone,setPhone] = useState("")
  const [otp,setOtp] = useState("")
  const [confirmation,setConfirmation] = useState<any>(null)

  const [verified,setVerified] = useState(false)

  const [password,setPassword] = useState("")
  const [confirmPassword,setConfirmPassword] = useState("")

  /* SEND OTP */

  const sendOTP = async () => {

    if(!/^[6-9]\d{9}$/.test(phone)){
      alert("Enter valid Indian mobile number")
      return
    }

    const fullPhone = `+91${phone}`

    const verifier = new RecaptchaVerifier(
      "recaptcha-container",
      { size:"invisible" },
      auth
    )

    const result = await signInWithPhoneNumber(
      auth,
      fullPhone,
      verifier
    )

    setConfirmation(result)

    alert("OTP Sent")
  }

  /* VERIFY OTP */

  const verifyOTP = async () => {

    try{

      await confirmation.confirm(otp)

      setVerified(true)

      alert("Phone verified")

    }catch{

      alert("Invalid OTP")

    }

  }

  /* RESET PASSWORD */

  const resetPassword = async () => {

    if(password !== confirmPassword){

      alert("Passwords do not match")

      return
    }

    if(!auth.currentUser){

      alert("User not authenticated")

      return
    }

    await updatePassword(auth.currentUser,password)

    alert("Password updated successfully")

  }

  return (

    <div className="space-y-4">

      {/* PHONE INPUT */}

      {!confirmation && (

        <>

          <div className="flex">

            <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-100 text-gray-700">
              +91
            </div>

            <Input
              type="tel"
              placeholder="Enter mobile number"
              value={phone}
              maxLength={10}
              className="rounded-l-none"
              onChange={(e)=>{

                const value = e.target.value.replace(/\D/g,"")

                setPhone(value)

              }}
            />

          </div>

          <Button
            className="w-full"
            onClick={sendOTP}
          >
            Send OTP
          </Button>

        </>

      )}

      {/* OTP INPUT */}

      {confirmation && !verified && (

        <>

          <Input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e)=>setOtp(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={verifyOTP}
          >
            Verify OTP
          </Button>

        </>

      )}

      {/* PASSWORD RESET */}

      {verified && (

        <>

          <p className="text-green-600 font-semibold">
            Phone verified ✔
          </p>

          <Input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e)=>setConfirmPassword(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={resetPassword}
          >
            Reset Password
          </Button>

        </>

      )}

      <div id="recaptcha-container"></div>

    </div>

  )
}

export default ForgotPasswordOTP
