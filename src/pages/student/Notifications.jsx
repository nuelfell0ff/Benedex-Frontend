import {
useEffect,
useState
}
from "react";

import API from "../../services/api";

function Notifications(){

const [notifications,setNotifications] =
useState([]);

const [loading,setLoading] =
useState(true);




useEffect(()=>{

const fetchNotifications =
async()=>{

try{

const res =
await API.get(
"/notifications"
);

setNotifications(
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

fetchNotifications();

},[]);




if(loading){

return <h1>Loading...</h1>;

}




return(

<div>

<h1>
Notifications
</h1>

{

notifications.length > 0

?

notifications.map((notification)=>(

<div key={notification._id}>

<h3>
{notification.title}
</h3>

<p>
{notification.message}
</p>

<hr />

</div>

))

:

<p>
No notifications
</p>

}

</div>

);

}

export default Notifications;