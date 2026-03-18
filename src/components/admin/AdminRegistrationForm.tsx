import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const AdminRegistrationForm = () => {

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [emailOTP, setEmailOTP] = useState("");
  const [phoneOTP, setPhoneOTP] = useState("");

  const handleChange = (e:any) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const sendOTP = async () => {

    // API call to send OTP
    console.log("Send OTP to", formData.email, formData.phone);

    setStep(2);

  };

  const verifyOTP = async () => {

    console.log("Verify OTP");

    setStep(3);

  };

  const submitRegistration = async () => {

    const data = {
      ...formData,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    console.log("Registration Request", data);

    alert("Registration submitted. Waiting for admin approval.");

  };

  return (

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

          <div>
            <Label>Indian Phone</Label>
            <Input placeholder="+91XXXXXXXXXX" name="phone" onChange={handleChange}/>
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

          <p>OTP Verified Successfully</p>

          <Button onClick={submitRegistration}>
            Submit Registration
          </Button>

        </div>

      )}

    </div>

  );

};

export default AdminRegistrationForm;
