import {
useEffect,
useState
}
from "react";

import API from "../../services/api";

function AdminPayments(){

const [payments,setPayments] =
useState([]);

const [loading,setLoading] =
useState(true);




useEffect(()=>{

const fetchPayments =
async()=>{

try{

const res =
await API.get(
"/payments"
);

setPayments(
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

fetchPayments();

},[]);




if(loading){

return <h1>Loading...</h1>;

}




return(

<div>

<h1>
Payments
</h1>



<table>

<thead>

<tr>

<th>
Student
</th>

<th>
Course
</th>

<th>
Amount
</th>

<th>
Status
</th>

</tr>

</thead>



<tbody>

{

payments.map((payment)=>(

<tr key={payment._id}>

<td>

{
payment.student?.fullName
}

</td>

<td>

{
payment.course?.title
}

</td>

<td>

₦{
payment.amount
}

</td>

<td>

{
payment.status
}

</td>

</tr>

))

}

</tbody>

</table>

</div>

);

}

export default AdminPayments;