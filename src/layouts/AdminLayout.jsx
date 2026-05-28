import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

function AdminLayout(){

const links = [

{
label:"Dashboard",
path:"/admin"
},

{
label:"Users",
path:"/admin/users"
},

{
label:"Courses",
path:"/admin/courses"
},

{
label:"Payments",
path:"/admin/payments"
},

{
label:"Analytics",
path:"/admin/analytics"
},

{
label:"Settings",
path:"/admin/settings"
}

];

return(

<div>

<Sidebar links={links} />

<div>

<Topbar />

<Outlet />

</div>

</div>

);

}

export default AdminLayout;