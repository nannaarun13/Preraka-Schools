import { useEffect,useState } from "react";
import { collection,getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import * as XLSX from "xlsx";

const Admissions = ()=>{

const [data,setData]=useState<any[]>([]);

const load=async()=>{

const snap=await getDocs(collection(db,"admissions"));

setData(
snap.docs.map(d=>({
id:d.id,
...d.data()
}))
);

};

useEffect(()=>{
load();
},[]);

const exportExcel=()=>{

const sheet=XLSX.utils.json_to_sheet(data);

const book=XLSX.utils.book_new();

XLSX.utils.book_append_sheet(book,sheet,"Admissions");

XLSX.writeFile(book,"Admissions.xlsx");

};

return(

<div>

<h2 className="text-xl font-bold">
Admissions
</h2>

<button onClick={exportExcel}>
Export Excel
</button>

<table border={1}>

<thead>

<tr>
<th>Student</th>
<th>Class</th>
<th>Previous</th>
<th>Father</th>
<th>Mother</th>
<th>Phone</th>
<th>Location</th>
</tr>

</thead>

<tbody>

{data.map(a=>(
<tr key={a.id}>

<td>{a.studentName}</td>
<td>{a.classApplied}</td>
<td>{a.previousClass}</td>
<td>{a.fatherName}</td>
<td>{a.motherName}</td>
<td>{a.primaryContact}</td>
<td>{a.location}</td>

</tr>
))}

</tbody>

</table>

</div>

);

};

export default Admissions;
