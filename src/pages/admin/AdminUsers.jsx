import {
useEffect,
useState
}
from "react";

import API from "../../services/api";

function AdminUsers(){

const [users,setUsers] =
useState([]);

const [loading,setLoading] =
useState(true);




useEffect(()=>{

const fetchUsers =
async()=>{

try{

const res =
await API.get(
"/users"
);

setUsers(
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

fetchUsers();

},[]);




const handleDelete =
async(id)=>{

try{

await API.delete(
`/users/${id}`
);

setUsers(

users.filter(

(user)=>

user._id !== id

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
User Management
</h1>



<table>

<thead>

<tr>

<th>
Name
</th>

<th>
Email
</th>

<th>
Role
</th>

<th>
Action
</th>

</tr>

</thead>



<tbody>

{

users.map((user)=>(

<tr key={user._id}>

<td>
{user.fullName}
</td>

<td>
{user.email}
</td>

<td>
{user.role}
</td>

<td>

<button

onClick={()=>

handleDelete(
user._id
)

}

>

Delete

</button>

</td>

</tr>

))

}

</tbody>

</table>

</div>

);

}

export default AdminUsers;