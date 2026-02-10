import { useContext,useEffect,useState,useRef } from "react";
import Chat from "./Chat";
import "./ChatWindow.css";
import { MyContext} from "./MyContext";
import {ScaleLoader} from "react-spinners"
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

 
function ChatWindow(){
    const {prompt,setPrompt,reply,setReply,currThreadId,prevChat,setPrevChat,setNewChat,showHistory,setShowHistory,user,setUser,setAllThreads,toast,setToast,showToast}=useContext(MyContext);
    const [loading,setLoading]=useState(false);
    const [isOpen,setIsOpen]=useState(false);
    const [voiceReply,setVoiceReply]=useState(false);
    const [auth,setAuth]=useState(null);
   const [signupdetails,setSignDetails]=useState({
    name:"",
    email:"",
    password:"",
   })

   const [loginDetails,setLoginDetails]=useState({
    email:"",
    password:""
   });

   

   const handleLoginForm=(e)=>{
    setLoginDetails((prev)=>({...prev,[e.target.name]:e.target.value}))
   }

   const handleForm=(e)=>{
    const {name,value}=e.target;

    setSignDetails((prev)=>({...prev,[name]:value}))
   }

    const getReply=async ()=>{
        if (!prompt.trim()) return;
        if(!user){
            showToast("Please login your account","error")
            setAuth("login");
            return;
        }
        setLoading(true);
        setNewChat(false);

const option={
    method:"POST",
    credentials:"include",
    headers:{
       "Content-Type":"application/json",
    },
    body:JSON.stringify({
        message:prompt,
        threadId:currThreadId
    })

}
try{
const response=await fetch("https://sigmagpt-wb5m.onrender.com/api/chat",option);
const res=await response.json();

console.log(res);
if(!response.ok){
    showToast(res.message||"Something went wrong","error");
    return;
}
setReply(res.reply);

if(voiceReply){
speakReply(res.reply);
}

if (res.thread) {
  setAllThreads(prev => {
    const exists = prev.some(t => t.threadId === res.thread.threadId);
    if (exists) return prev;

    return [
      {
        threadId: res.thread.threadId,
        title: res.thread.title
      },
      ...prev
    ];
  });
}
}catch(err){
    console.log(err);
    showToast(err.message||"Something went wrong","error");
}finally{
setLoading(false);

}
    }

    useEffect(()=>{
if(prompt && reply){
    if (!reply) return;
setPrevChat(prevChat=>(
    [...prevChat,{
        role:"user",
        content:prompt
    },
{
    role:"assistant",
    content:reply
}])
)
}
setPrompt('');
    },[reply])

    const handleProfileClick=()=>{
        setIsOpen(!isOpen);
    }

   const handleLogOut=async()=>{
    try{
        const res=await fetch("https://sigmagpt-wb5m.onrender.com/api/logout",{
            method:"POST",
            credentials:"include",
        });
        if(res.ok){
            showToast("LogOut sucessfully","success");

        }
        
    }catch(err){
        console.log(err);
        showToast(err.message,"error");
    }

    setUser(null);
    setPrevChat([]);
    setReply("");
    setPrompt("")
   }

   const handleSignup=async()=>{
    try{
const res=await fetch("https://sigmagpt-wb5m.onrender.com/api/signup",{
    method:"POST",
    headers:{
        "Content-Type":"application/json"
    },
    body:JSON.stringify({
name:signupdetails.name,
email:signupdetails.email,
password:signupdetails.password
    })
});

const data=await res.json();

console.log(data);
if(res.ok){
showToast(data.message,"success");
}else{
    showToast(data.message,"error");
}
setAuth("login");
setSignDetails({name:"",email:"",password:""});
setUser(null);
    }catch(err){
        showToast(err.message||"Something went wrong","error");
    }
   }

   const handleLogin=async ()=>{
try{
    const res=await fetch("https://sigmagpt-wb5m.onrender.com/api/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        credentials:"include",
        body:JSON.stringify(loginDetails),
    });
    const data=await res.json();

    if(!res.ok){
       
        showToast("Invalid credentials","error");
        return;
    }

    showToast("Login Successfull","success");
    console.log(data);
    setUser(data.user);
    setAuth(null)
    setLoginDetails({email:"",password:""});
}catch(err){
    showToast(err.message||"Something went wrong","error");
}
    
   }

   const recognitionRef = useRef(null);
   const silenceTimerRef=useRef(null);
   const [isListening,setIsListening]=useState(false);
   const livePromptRef=useRef(null);

useEffect(() => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition not supported");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-IN"; // or hi-IN
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onresult = (e) => {
    const text = e.results[e.results.length - 1][0].transcript;
livePromptRef.current=livePromptRef.current?livePromptRef.current+" "+text:text;
    setPrompt(livePromptRef.current);

    // 🔥 silence detect
    clearTimeout(silenceTimerRef.current);

   

    silenceTimerRef.current = setTimeout(() => {
      autoSend(); // AUTO SEND
    }, 1200);
  };

  // 🔁 auto restart mic (ChatGPT magic)
  recognition.onend = () => {
    if (isListening) {
      recognition.start();
    }
  };

  recognition.onerror = () => {
    setIsListening(false);
  };

  recognitionRef.current = recognition;
}, [isListening]);


const startVoice = () => {

    if(!user){
        showToast("Please login to start a chat","error");
        setAuth("login");
        return;
    }
    
  if (!recognitionRef.current) return;
 
    setVoiceReply(true);
  recognitionRef.current.start();
  setIsListening(true);
  
};

const stopVoice=()=>{
    if(!recognitionRef.current) return;

    recognitionRef.current?.stop();
    clearTimeout(silenceTimerRef.current);
    window.speechSynthesis.cancel();

    setIsListening(false);
    setVoiceReply(false);
}

const autoSend = async () => {
  if (!prompt.trim()) return;
console.log("Auto send:- "+prompt);
  recognitionRef.current?.stop();
  setIsListening(false);

  await getReply();

  livePromptRef.current = ""; // reset
  
};

const speakReply=(text)=>{
if(!voiceReply) return;

const utterance=new SpeechSynthesisUtterance(text);
utterance.lang="en-IN";
utterance.rate=1;
utterance.pitch=1;



window.speechSynthesis.speak(utterance);
}

    return(
        <>
<Snackbar
open={toast.open}
autoHideDuration={3000}
onClose={()=>setToast({...toast,open:false})}
anchorOrigin={{vertical:"top",horizontal:"right"}}
>
<Alert
onClose={()=>setToast({...toast,open:false})}
severity={toast.severity}
variant="filled">
{toast.message}
</Alert>
</Snackbar>
        
        {auth &&
<div className="overlay">
        {

    auth==="signup" &&
    <div className="signupForm">
 <h1>Signup</h1>
    <input type="text" name="name" value={signupdetails.name} onChange={handleForm} placeholder="Enter your name"/>
    <input type="email" name="email" value={signupdetails.email} onChange={handleForm} placeholder="Enter your Email"/>
    <input type="password" name="password" value={signupdetails.password} onChange={handleForm} placeholder="Enter password"/>
    <button onClick={handleSignup}>Signup</button>
    <p>Already have an account <span onClick={()=>setAuth("login")} style={{color:"blue",cursor:"pointer"}}>Login</span></p>
    </div> 
    }
    {
auth==="login" &&
<div className="loginForm">
    <h1>Login</h1>
    <input type="email" name="email" value={loginDetails.email} onChange={handleLoginForm} placeholder="Enter your Email"/>
    <input type="password" name="password" value={loginDetails.password} onChange={handleLoginForm} placeholder="Enter password"/>
    <button onClick={handleLogin}>Login</button>
    <p>Don't have an account <span onClick={()=>setAuth("signup")} style={{color:"blue",cursor:"pointer"}}>Signup</span></p>
</div>

}
</div>
}
       
        <div className={`chatwindow ${showHistory?"active":""} ${auth?"light":""}`} >

<div className="navbar">
    <div className="his">
<i className={`fa-solid fa-bars ${showHistory?"active":""}`} onClick={()=>setShowHistory(!showHistory)}></i>
    </div>
    
<span>SigmaGPT <i class="fa-solid fa-caret-down"></i></span>
<div className="userIconDiv" onClick={handleProfileClick}>
    {
        user?
    
  <span className="userIcon" ><i class="fa-solid fa-user"></i>
  </span>
  :
  
  <button onClick={()=>setAuth("signup")}>Sign Up</button>
  
    }
</div>


</div>


{
    isOpen && user &&
    <div className="dropdown">
                    <div className="dropdownItem"><i class="fa-solid fa-cloud-arrow-up"></i> Upgrade</div>
                    <div className="dropdownItem"><i class="fa-solid fa-gear"></i> Setting</div>
                    <div className="dropdownItem" onClick={handleLogOut}><i class="fa-solid fa-right-from-bracket"></i> Log Out</div>
                </div>
}


<Chat/>

<ScaleLoader color="#fff" loading={loading}>

</ScaleLoader>
<div className="chatInput">
<div className="inputbox">
<input placeholder="Ask Anything" value={prompt} 
onChange={(e)=>setPrompt(e.target.value)}
onKeyDown={(e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    getReply();
  }
}}


></input>
{
    isListening ?
    <div className="mic" style={{color:"red",padding:"1rem"}} onClick={stopVoice}>End...</div>
    :
    <div className="mic"  onClick={startVoice}><i class="fa-solid fa-microphone"></i></div>
}

<div id="sumbit" onClick={getReply}><i class="fa-solid fa-paper-plane"></i></div>

</div>

    <p className="info">SigmaGPT can make mistakes. Check important info. See cookie preferences.</p>

</div>
        </div>

        
        </>
    )
}

export default ChatWindow;