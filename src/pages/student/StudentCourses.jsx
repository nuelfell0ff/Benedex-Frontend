import {
useEffect,
useState
}
from "react";

import {
Link
}
from "react-router-dom";

import API from "../../services/api";

function StudentCourses(){

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




const handleEnroll =
async(courseId)=>{

try{

const res =
await API.post(

"/payments/initialize",

{
courseId
}

);

window.location.href =
res.data.authorization_url;

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
Courses
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

<p>

Price:

₦{course.price}

</p>



<button

onClick={()=>handleEnroll(
course._id
)}

>

Enroll

</button>



<Link
to={`/student/courses/${course._id}`}
>

<button>

View Course

</button>

</Link>

<hr />

</div>

))

}

</div>

);

}

export default StudentCourses;