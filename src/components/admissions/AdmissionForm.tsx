import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const AdmissionForm = () => {

const [form,setForm]=useState({
studentName:"",
classApplied:"",
previousClass:"",
fatherName:"",
motherName:"",
primaryContact:"",
location:""
});

const handleChange=(e)=>{
setForm({
...form,
[e.target.name]:e.target.value
});
};

const handleSubmit=async(e)=>{

e.preventDefault();

try{

await addDoc(collection(db,"admissions"),{
...form,
createdAt:serverTimestamp()
});

alert("Admission submitted successfully");

setForm({
studentName:"",
classApplied:"",
previousClass:"",
fatherName:"",
motherName:"",
primaryContact:"",
location:""
});

}catch(err){
console.error(err);
alert("Error submitting form");
}

};

return(

<div className="max-w-xl mx-auto p-4">

<h2 className="text-2xl font-bold mb-4">
Student Admission Form
</h2>

<form onSubmit={handleSubmit} className="space-y-3">

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
className="bg-blue-600 text-white px-4 py-2"
>
Submit Admission
</button>

</form>

</div>

);

};

export default AdmissionForm;
