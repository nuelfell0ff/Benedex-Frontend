import {
useEffect,
useState
}
from "react";

import API from "../../services/api";

function Assignments(){

const [assignments,setAssignments] =
useState([]);

const [selectedFile,setSelectedFile] =
useState(null);

const [loading,setLoading] =
useState(true);




useEffect(()=>{

const fetchAssignments =
async()=>{

try{

const res =
await API.get(
"/assignments"
);

setAssignments(
res.data
);

}
catch(error){

console.log(error);

}
finally{

setLoading(false);

}

};

fetchAssignments();

},[]);




const handleFileChange =
(e)=>{

setSelectedFile(
e.target.files[0]
);

};




const handleSubmit =
async(assignmentId)=>{

try{

const formData =
new FormData();

formData.append(
"assignment",
assignmentId
);

formData.append(
"file",
selectedFile
);



await API.post(

"/assignments/submit",

formData,

{

headers:{

"Content-Type":
"multipart/form-data"

}

}

);



alert(
"Assignment submitted successfully"
);

}
catch(error){

console.log(error);

}

};




if(loading){

return <h1>Loading...</h1>;

}




return(

<div>

<h1>
Assignments
</h1>



{

assignments.map((assignment)=>(

<div key={assignment._id}>

<h2>
{assignment.title}
</h2>

<p>
{assignment.description}
</p>

<p>

Due Date:

{
new Date(
assignment.dueDate
).toLocaleDateString()
}

</p>



<input
type="file"
onChange={handleFileChange}
/>



<button

onClick={()=>

handleSubmit(
assignment._id
)

}

>

Submit Assignment

</button>

<hr />

</div>

))

}

</div>

);

}

export default Assignments;