import { useState } from "react"
import { auth } from "@/lib/firebase"

import {
 RecaptchaVerifier,
 signInWithPhoneNumber
} from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const PhoneOTP = ({ phone, onVerified }:any) => {

 const [otp,setOtp] = useState("")
 const [confirmation,setConfirmation] = useState<any>(null)

 const sendOTP = async () => {

  const verifier = new RecaptchaVerifier(
   "recaptcha-container",
   { size:"invisible" },
   auth
  )

  const result = await signInWithPhoneNumber(
   auth,
   "+91"+phone,
   verifier
  )

  setConfirmation(result)
 }

 const verifyOTP = async () => {

  await confirmation.confirm(otp)

  onVerified()

 }

 return(

  <div className="space-y-4">

   {!confirmation && (

    <Button onClick={sendOTP}>
     Send Phone OTP
    </Button>

   )}

   {confirmation && (

    <>
     <Input
      placeholder="Enter OTP"
      value={otp}
      onChange={(e)=>setOtp(e.target.value)}
     />

     <Button onClick={verifyOTP}>
      Verify Phone
     </Button>
    </>

   )}

   <div id="recaptcha-container"></div>

  </div>

 )

}

export default PhoneOTP
