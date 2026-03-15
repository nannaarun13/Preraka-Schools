import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AdmissionForm = () => {

const { toast } = useToast();

const [formData,setFormData] = useState({
studentName:"",
classApplied:"",
previousClass:"",
previousSchool:"",
fatherName:"",
motherName:"",
primaryContact:"",
secondaryContact:"",
location:"",
additionalInfo:""
});

const classes = [
"NURSERY",
"LKG",
"UKG",
"CLASS 1",
"CLASS 2",
"CLASS 3",
"CLASS 4",
"CLASS 5",
"CLASS 6",
"CLASS 7"
];

const formatPhone = (value:string) => {

let digits = value.replace(/\D/g,"");

if(digits.length > 10){
digits = digits.slice(0,10);
}

if(digits.length > 5){
return digits.slice(0,5) + " " + digits.slice(5);
}

return digits;
};

const handleChange = (e:any)=>{

const {name,value} = e.target;

if(name==="primaryContact" || name==="secondaryContact"){
setFormData(prev=>({
...prev,
[name]:formatPhone(value)
}));
return;
}

if(["studentName","fatherName","motherName","location","previousSchool"].includes(name)){
setFormData(prev=>({
...prev,
[name]:value.toUpperCase()
}));
return;
}

setFormData(prev=>({...prev,[name]:value}));

};

const handleSelect = (name:string,value:string)=>{
setFormData(prev=>({...prev,[name]:value}));
};

const validateForm = ()=>{

if(
!formData.studentName ||
!formData.classApplied ||
!formData.previousClass ||
!formData.fatherName ||
!formData.motherName ||
!formData.primaryContact ||
!formData.location
){
toast({
title:"Fill Required Fields",
description:"All * fields are mandatory",
variant:"destructive"
});
return false;
}

const phone = formData.primaryContact.replace(/\s/g,"");

if(phone.length !== 10){
toast({
title:"Invalid Mobile Number",
description:"Mobile number must be 10 digits",
variant:"destructive"
});
return false;
}

return true;

};

const handleSubmit = (e:any)=>{

e.preventDefault();

if(!validateForm()) return;

const finalData = {
...formData,
primaryContact:"+91 "+formData.primaryContact,
secondaryContact:formData.secondaryContact
? "+91 "+formData.secondaryContact
:""
};

console.log(finalData);

toast({
title:"Admission Submitted",
description:"We will contact you soon."
});

setFormData({
studentName:"",
classApplied:"",
previousClass:"",
previousSchool:"",
fatherName:"",
motherName:"",
primaryContact:"",
secondaryContact:"",
location:"",
additionalInfo:""
});

};

return(

<section>

<Card className="max-w-4xl mx-auto">

<CardHeader className="bg-blue-600 text-white text-center">
<CardTitle>Admission Inquiry Form</CardTitle>
</CardHeader>

<CardContent className="p-8">

<form onSubmit={handleSubmit} className="space-y-8">

<div className="grid md:grid-cols-2 gap-x-6 gap-y-8">

<div className="space-y-1">

<Label>Student Name *</Label>

<Input
name="studentName"
value={formData.studentName}
onChange={handleChange}
placeholder="ENTER STUDENT NAME"
className="uppercase h-12"
required
/>

</div>

<div className="space-y-1">

<Label>Class Applied For *</Label>

<Select
value={formData.classApplied}
onValueChange={(v)=>handleSelect("classApplied",v)}
>

<SelectTrigger className="h-12">
<SelectValue placeholder="Select class"/>
</SelectTrigger>

<SelectContent>
{classes.map(c=>(
<SelectItem key={c} value={c}>{c}</SelectItem>
))}
</SelectContent>

</Select>

</div>

<div className="space-y-1">

<Label>Previous Class *</Label>

<Select
value={formData.previousClass}
onValueChange={(v)=>handleSelect("previousClass",v)}
>

<SelectTrigger className="h-12">
<SelectValue placeholder="Select previous class"/>
</SelectTrigger>

<SelectContent>
{classes.map(c=>(
<SelectItem key={c} value={c}>{c}</SelectItem>
))}
</SelectContent>

</Select>

</div>

<div className="space-y-1">

<Label>Previous School</Label>

<Input
name="previousSchool"
value={formData.previousSchool}
onChange={handleChange}
placeholder="ENTER PREVIOUS SCHOOL"
className="uppercase h-12"
/>

</div>

<div className="space-y-1">

<Label>Father's Name *</Label>

<Input
name="fatherName"
value={formData.fatherName}
onChange={handleChange}
placeholder="ENTER FATHER NAME"
className="uppercase h-12"
required
/>

</div>

<div className="space-y-1">

<Label>Mother's Name *</Label>

<Input
name="motherName"
value={formData.motherName}
onChange={handleChange}
placeholder="ENTER MOTHER NAME"
className="uppercase h-12"
required
/>

</div>

<div className="space-y-1">

<Label>Primary Contact *</Label>

<div className="flex items-center border rounded-md h-12">

<span className="px-3 bg-gray-100 border-r text-sm font-medium">
+91
</span>

<input
type="text"
name="primaryContact"
value={formData.primaryContact}
onChange={handleChange}
className="flex-1 px-3 outline-none"
placeholder="98765 43210"
required
/>

</div>

</div>

<div className="space-y-1">

<Label>Secondary Contact</Label>

<div className="flex items-center border rounded-md h-12">

<span className="px-3 bg-gray-100 border-r text-sm font-medium">
+91
</span>

<input
type="text"
name="secondaryContact"
value={formData.secondaryContact}
onChange={handleChange}
className="flex-1 px-3 outline-none"
placeholder="98765 43210"
/>

</div>

</div>

<div className="md:col-span-2 space-y-1">

<Label>Location / Address *</Label>

<Input
name="location"
value={formData.location}
onChange={handleChange}
placeholder="ENTER LOCATION / ADDRESS"
className="uppercase h-12"
required
/>

</div>

</div>

<div className="space-y-1">

<Label>Additional Information</Label>

<Textarea
name="additionalInfo"
value={formData.additionalInfo}
onChange={handleChange}
rows={4}
placeholder="Any additional information"
/>

</div>

<Button
type="submit"
className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
>

Submit Admission Inquiry

</Button>

</form>

</CardContent>

</Card>

</section>

);

};

export default AdmissionForm;
