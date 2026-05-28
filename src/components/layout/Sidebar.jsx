import { Link } from "react-router-dom";

function Sidebar({ links }){

return(

<div>

<h2>
Benedex LMS
</h2>

<ul>

{

links.map((link,index)=>(

<li key={index}>

<Link to={link.path}>

{link.label}

</Link>

</li>

))

}

</ul>

</div>

);

}

export default Sidebar;