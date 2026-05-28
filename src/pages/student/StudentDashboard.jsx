import {
useEffect,
useState
}
from "react";

import API from "../../services/api";

function StudentDashboard(){

const [dashboard,setDashboard] =
useState(null);

const [loading,setLoading] =
useState(true);




useEffect(()=>{

const fetchDashboard =
async()=>{

try{

const res =
await API.get(
"/dashboard/student"
);

setDashboard(
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

fetchDashboard();

},[]);




if(loading){

return <h1>Loading...</h1>;

}



return(

<div>

<h1>
Student Dashboard
</h1>



<hr />



<h2>
Profile
</h2>

<p>

Name:
{dashboard?.profile?.fullName}

</p>

<p>

Email:
{dashboard?.profile?.email}

</p>



<hr />



<h2>
XP
</h2>

<p>

{dashboard?.xp}

XP

</p>



<hr />



<h2>
Badges
</h2>

{

dashboard?.badges?.length > 0

?

dashboard.badges.map((badge,index)=>(

<p key={index}>

{badge}

</p>

))

:

<p>
No badges yet
</p>

}



<hr />



<h2>
Enrolled Courses
</h2>

{

dashboard?.enrolledCourses?.length > 0

?

dashboard.enrolledCourses.map((course)=>(

<div key={course._id}>

<h4>
{course.title}
</h4>

<p>
{course.description}
</p>

</div>

))

:

<p>
No enrolled courses
</p>

}



<hr />



<h2>
Assignment Submissions
</h2>

{

dashboard?.submissions?.length > 0

?

dashboard.submissions.map((submission)=>(

<div key={submission._id}>

<p>

Assignment:

{submission.assignment?.title}

</p>

<p>

Grade:

{

submission.grade !== null

?

submission.grade

:

"Pending"

}

</p>

<p>

Status:

{submission.status}

</p>

</div>

))

:

<p>
No submissions
</p>

}

</div>

);

}

export default StudentDashboard;