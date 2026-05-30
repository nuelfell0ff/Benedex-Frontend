import {
useEffect,
useState
}
from "react";

import API from "../../services/api";

function AdminAnalytics(){

const [analytics,setAnalytics] =
useState(null);

const [loading,setLoading] =
useState(true);




useEffect(()=>{

const fetchAnalytics =
async()=>{

try{

const res =
await API.get(
"/admin/analytics"
);

setAnalytics(
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

fetchAnalytics();

},[]);




if(loading){

return <h1>Loading...</h1>;

}




return(

<div>

<h1>
Admin Analytics
</h1>

<hr />



<p>

Total Users:

{
analytics?.totalUsers
}

</p>



<p>

Total Students:

{
analytics?.totalStudents
}

</p>



<p>

Total Instructors:

{
analytics?.totalInstructors
}

</p>



<p>

Total Courses:

{
analytics?.totalCourses
}

</p>



<p>

Total Revenue:

₦{
analytics?.totalRevenue
}

</p>

</div>

);

}

export default AdminAnalytics;