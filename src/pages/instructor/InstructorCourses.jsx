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

function InstructorCourses(){

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




if(loading){

return <h1>Loading...</h1>;

}




return(

<div>

<h1>
Instructor Courses
</h1>



<Link to="/instructor/create-course">

<button>
Create Course
</button>

</Link>



<hr />



{

courses.map((course)=>(

<div key={course._id}>

<h2>
{course.title}
</h2>

<p>
{course.description}
</p>



<Link
to={`/instructor/create-module/${course._id}`}
>

<button>

Add Module

</button>

</Link>



<Link
to={`/instructor/create-assignment/${course._id}`}
>

<button>

Add Assignment

</button>

</Link>

<hr />

</div>

))

}

</div>

);

}

export default InstructorCourses;