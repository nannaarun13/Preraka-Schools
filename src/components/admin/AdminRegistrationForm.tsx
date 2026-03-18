import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

const AdminRegistrationForm = () => {

  const [step,setStep] = useState(1)

  const [generatedEmailOTP,setGeneratedEmailOTP] = useState("")

  const [emailOTP,setEmailOTP] = useState("")
  const [phoneOTP,setPhoneOTP] = useState("")

  const [formData,setFormData] = useState({
    firstName:"",
    lastName:"",
    email:"",
    phone:"",
    password:"",
    confirmPassword:""
  })

  const handleChange = (e:any) => {

    setFormData({
      ...formData,
      [e.target.name]:e.target.value
    })

  }

  /* SEND OTP */

  const sendOTP = () => {

    if(!formData.email || !formData.phone){

      alert("Email and phone required")
      return

    }

    if(formData.password !== formData.confirmPassword){

      alert("Passwords do not match")
      return

    }

    const otp = Math.floor(100000 + Math.random()*900000)

    setGeneratedEmailOTP(otp.toString())

    alert("Demo Email OTP: "+otp)

    console.log("Send Email OTP to",formData.email)

    console.log("Send Phone OTP to +91"+formData.phone)

    setStep(2)

  }

  /* VERIFY OTP */

  const verifyOTP = () => {

    if(emailOTP !== generatedEmailOTP){

      alert("Invalid Email OTP")
      return

    }

    if(phoneOTP.length !== 6){

      alert("Enter valid phone OTP")
      return

    }

    setStep(3)

  }

  /* SUBMIT REGISTRATION */

  const submitRegistration = async () => {

    const data = {

      firstName:formData.firstName,
      lastName:formData.lastName,
      email:formData.email,
      phone:"+91"+formData.phone,
      status:"pending",
      createdAt:new Date().toISOString()

    }

    try{

      await addDoc(
        collection(db,"admins"),
        data
      )

      alert("Registration submitted. Waiting for approval.")

      setStep(1)

    }catch(error){

      console.error(error)

      alert("Failed to submit registration")

    }

  }

  return(

    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">

      <h2 className="text-xl font-bold mb-6 text-center">
        Admin Registration
      </h2>

      {/* STEP 1 FORM */}

      {step === 1 && (

        <div className="space-y-4">

          <div>
            <Label>First Name</Label>
            <Input name="firstName" onChange={handleChange}/>
          </div>

          <div>
            <Label>Last Name</Label>
            <Input name="lastName" onChange={handleChange}/>
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" name="email" onChange={handleChange}/>
          </div>

          {/* PHONE WITH +91 */}

          <div>

            <Label>Indian Phone</Label>

            <div className="flex">

              <span className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-md">
                +91
              </span>

              <Input
                name="phone"
                maxLength={10}
                placeholder="9876543210"
                className="rounded-l-none"
                onChange={handleChange}
              />

            </div>

          </div>

          <div>
            <Label>Password</Label>
            <Input type="password" name="password" onChange={handleChange}/>
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input type="password" name="confirmPassword" onChange={handleChange}/>
          </div>

          <Button onClick={sendOTP} className="w-full">
            Send OTP
          </Button>

        </div>

      )}

      {/* STEP 2 OTP */}

      {step === 2 && (

        <div className="space-y-4">

          <div>
            <Label>Email OTP</Label>
            <Input
              value={emailOTP}
              onChange={(e)=>setEmailOTP(e.target.value)}
            />
          </div>

          <div>
            <Label>Mobile OTP</Label>
            <Input
              value={phoneOTP}
              onChange={(e)=>setPhoneOTP(e.target.value)}
            />
          </div>

          <Button onClick={verifyOTP} className="w-full">
            Verify OTP
          </Button>

        </div>

      )}

      {/* STEP 3 SUBMIT */}

      {step === 3 && (

        <div className="space-y-4 text-center">

          <p className="text-green-600 font-semibold">
            OTP Verified Successfully
          </p>

          <Button onClick={submitRegistration}>
            Submit Registration
          </Button>

        </div>

      )}

    </div>

  )

}

export default AdminRegistrationForm
