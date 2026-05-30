import {
useEffect,
useState
}
from "react";

import API from "../../services/api";

function AdminCourses(){

const [courses,setCourses] =
useState([]);

const [loading,setLoading] =
useState(true);




useEffect(()=>{

const fetchCourses =
async()=>{

try{

const res =
await API.get(
"/courses"
);

setCourses(
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

fetchCourses();

},[]);




const handleDelete =
async(id)=>{

try{

await API.delete(
`/courses/${id}`
);

setCourses(

courses.filter(

(course)=>

course._id !== id

)

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
Course Management
</h1>



{

courses.map((course)=>(

<div key={course._id}>

<h2>
{course.title}
</h2>

<p>
{course.description}
</p>



<button

onClick={()=>

handleDelete(
course._id
)

}

>

Delete Course

</button>

<hr />

</div>

))

}

</div>

);

}

export default AdminCourses;