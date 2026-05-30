import {
useEffect,
useState
}
from "react";

import API from "../../services/api";

function AdminSettings(){

const [settings,setSettings] =
useState({

siteName:"",
supportEmail:"",
maintenanceMode:false

});




useEffect(()=>{

const fetchSettings =
async()=>{

try{

const res =
await API.get(
"/settings"
);

setSettings(
res.data
);

}
catch(error){

console.log(error);

}

};

fetchSettings();

},[]);




const handleChange =
(e)=>{

const {

name,
value,
type,
checked

}=e.target;



setSettings({

...settings,

[name]:

type === "checkbox"
? checked
: value

});

};




const handleSubmit =
async(e)=>{

e.preventDefault();

try{

await API.put(

"/settings",

settings

);

alert(
"Settings updated"
);

}
catch(error){

console.log(error);

}

};




return(

<div>

<h1>
Platform Settings
</h1>



<form onSubmit={handleSubmit}>

<input
type="text"
name="siteName"
placeholder="Site Name"
value={settings.siteName}
onChange={handleChange}
/>

<input
type="email"
name="supportEmail"
placeholder="Support Email"
value={settings.supportEmail}
onChange={handleChange}
/>



<label>

Maintenance Mode

<input
type="checkbox"
name="maintenanceMode"
checked={settings.maintenanceMode}
onChange={handleChange}
/>

</label>



<button type="submit">

Save Settings

</button>

</form>

</div>

);

}

export default AdminSettings;