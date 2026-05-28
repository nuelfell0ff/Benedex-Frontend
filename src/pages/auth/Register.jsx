import {
useState
}
from "react";

import {
useNavigate
}
from "react-router-dom";

import {
useAuth
}
from "../../context/AuthContext";



function Register(){

const navigate =
useNavigate();

const { register } =
useAuth();


const [formData,setFormData] =
useState({

fullName:"",
email:"",
password:"",
role:"student"

});



const handleChange = (e)=>{

setFormData({

...formData,
[e.target.name]:
e.target.value

});

};



const handleSubmit =
async(e)=>{

e.preventDefault();

try{

await register(formData);

navigate("/login");

}
catch(error){

console.log(error);

}

};



return(

<div>

<h1>
Register
</h1>

<form onSubmit={handleSubmit}>

<input
type="text"
name="fullName"
placeholder="Full Name"
onChange={handleChange}
/>

<input
type="email"
name="email"
placeholder="Email"
onChange={handleChange}
/>

<input
type="password"
name="password"
placeholder="Password"
onChange={handleChange}
/>

<input
type="hidden"
name="role"
value="student"
/>

<button type="submit">

Register

</button>

</form>

</div>

);

}

export default Register;