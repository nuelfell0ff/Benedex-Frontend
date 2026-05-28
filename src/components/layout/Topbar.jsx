import { useAuth } from "../../context/AuthContext";

function Topbar(){

const {

user,
logout

}=useAuth();

return(

<div>

<h3>

Welcome,
{user?.fullName}

</h3>

<button onClick={logout}>

Logout

</button>

</div>

);

}

export default Topbar;