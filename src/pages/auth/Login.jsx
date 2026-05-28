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



function Login(){

const navigate =
useNavigate();

const { login } =
useAuth();


const [formData,setFormData] =
useState({

email:"",
password:""

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

await login(formData);

navigate("/");

}
catch(error){

console.log(error);

}

};



return(

<div>

<h1>
Login
</h1>

<form onSubmit={handleSubmit}>

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

<button type="submit">

Login

</button>

</form>

</div>

);

}

export default Login;