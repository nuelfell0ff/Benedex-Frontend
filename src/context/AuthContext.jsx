import {

createContext,
useContext,
useEffect,
useState

}
from "react";

import API from "../services/api";

const AuthContext =
createContext();



export const AuthProvider =
({ children })=>{

const [user,setUser] =
useState(null);

const [loading,setLoading] =
useState(true);




// Load user from localStorage
useEffect(()=>{

const storedUser =
localStorage.getItem(
"user"
);

if(storedUser){

setUser(
JSON.parse(storedUser)
);

}

setLoading(false);

},[]);




// Register
const register = async(data)=>{

const res =
await API.post(

"/auth/register",
data

);

localStorage.setItem(
"token",
res.data.token
);

localStorage.setItem(
"user",
JSON.stringify(res.data)
);

setUser(res.data);

};




// Login
const login = async(data)=>{

const res =
await API.post(

"/auth/login",
data

);

localStorage.setItem(
"token",
res.data.token
);

localStorage.setItem(
"user",
JSON.stringify(res.data)
);

setUser(res.data);

};




// Logout
const logout = ()=>{

localStorage.removeItem(
"token"
);

localStorage.removeItem(
"user"
);

setUser(null);

};



return(

<AuthContext.Provider

value={{

user,
loading,
register,
login,
logout

}}

>

{children}

</AuthContext.Provider>

);

};



export const useAuth = ()=>{

return useContext(
AuthContext
);

};