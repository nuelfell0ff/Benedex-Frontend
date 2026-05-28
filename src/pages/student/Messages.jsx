import {
useEffect,
useState
}
from "react";

import io from "socket.io-client";

import API from "../../services/api";

const socket =
io("http://localhost:5000");

function Messages(){

const [messages,setMessages] =
useState([]);

const [message,setMessage] =
useState("");

const room =
"general-room";




useEffect(()=>{

socket.emit(
"join-room",
room
);



socket.on(

"receive-message",

(data)=>{

setMessages((prev)=>([
...prev,
data
]));

}

);



return ()=>{

socket.off(
"receive-message"
);

};

},[]);




const sendMessage =
async()=>{

if(!message){

return;
}


const messageData = {

room,
message

};



socket.emit(
"send-message",
messageData
);



setMessages((prev)=>([
...prev,
messageData
]));



setMessage("");

};




return(

<div>

<h1>
Messages
</h1>



<div>

{

messages.map((msg,index)=>(

<p key={index}>

{msg.message}

</p>

))

}

</div>



<input

type="text"

value={message}

onChange={(e)=>

setMessage(
e.target.value
)

}

/>



<button onClick={sendMessage}>

Send

</button>

</div>

);

}

export default Messages;