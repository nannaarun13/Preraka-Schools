import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

type AdmissionFormData = {
  studentName: string;
  classApplied: string;
  previousClass: string;
  fatherName: string;
  motherName: string;
  primaryContact: string;
  location: string;
};

const AdmissionForm = () => {

  const [form, setForm] = useState<AdmissionFormData>({
    studentName: "",
    classApplied: "",
    previousClass: "",
    fatherName: "",
    motherName: "",
    primaryContact: "",
    location: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    try {

      setLoading(true);

      await addDoc(collection(db, "admissions"), {
        ...form,
        createdAt: serverTimestamp()
      });

      alert("Admission submitted successfully");

      setForm({
        studentName: "",
        classApplied: "",
        previousClass: "",
        fatherName: "",
        motherName: "",
        primaryContact: "",
        location: ""
      });

    } catch (error) {

      console.error("Submission error:", error);
      alert("Failed to submit admission");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="max-w-xl mx-auto p-6">

      <h2 className="text-2xl font-bold mb-6 text-center">
        Student Admission Form
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          type="text"
          name="studentName"
          placeholder="Student Name"
          value={form.studentName}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />

        <input
          type="text"
          name="classApplied"
          placeholder="Class Applying For"
          value={form.classApplied}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />

        <input
          type="text"
          name="previousClass"
          placeholder="Previous Class"
          value={form.previousClass}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          type="text"
          name="fatherName"
          placeholder="Father Name"
          value={form.fatherName}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />

        <input
          type="text"
          name="motherName"
          placeholder="Mother Name"
          value={form.motherName}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          type="tel"
          name="primaryContact"
          placeholder="Phone Number"
          value={form.primaryContact}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 w-full"
        >
          {loading ? "Submitting..." : "Submit Admission"}
        </button>

      </form>

    </div>

  );

};

export default AdmissionForm;
