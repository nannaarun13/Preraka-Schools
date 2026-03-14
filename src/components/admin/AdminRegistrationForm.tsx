import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminRegistrationFormProps {
  onSuccess?: () => void;
}

const AdminRegistrationForm: React.FC<AdminRegistrationFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      console.log("Admin Registration Data:", formData);

      // Here you can add Firebase registration later

      if (onSuccess) {
        onSuccess();
      }

      alert("Admin registered successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        Admin Registration
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <Input
          name="name"
          placeholder="Admin Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          name="email"
          type="email"
          placeholder="Admin Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registering..." : "Register Admin"}
        </Button>

      </form>
    </div>
  );
};

export default AdminRegistrationForm;
