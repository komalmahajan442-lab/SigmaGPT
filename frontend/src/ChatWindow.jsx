import { useContext,useEffect,useState } from "react";
import Chat from "./Chat";
import "./ChatWindow.css";
import { MyContext} from "./MyContext";
import {ScaleLoader} from "react-spinners"


 
function ChatWindow(){
    const {prompt,setPrompt,reply,setReply,currThreadId,prevChat,setPrevChat,setNewChat,showHistory,setShowHistory,user,setUser,setAllThreads}=useContext(MyContext);
    const [loading,setLoading]=useState(false);
    const [isOpen,setIsOpen]=useState(false);
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
        if(!user){
            setAuth("login");
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
const response=await fetch("http://localhost:8080/api/chat",option);
const res=await response.json();
console.log(res);
setReply(res.reply);
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
}
setLoading(false)
    }

    useEffect(()=>{
if(prompt && reply){
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
setPrompt('')
    },[reply])

    const handleProfileClick=()=>{
        setIsOpen(!isOpen);
    }

   const handleLogOut=async()=>{
    try{
        const res=await fetch("http://localhost:8080/api/logout",{
            method:"POST",
            credentials:"include",
        });
        
    }catch(err){
        console.log(err);
    }

    setUser(null);
    setPrevChat([]);
    setReply("");
    setPrompt("")
   }

   const handleSignup=async()=>{
const res=await fetch("http://localhost:8080/api/signup",{
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
setAuth("login");
setSignDetails({name:"",email:"",password:""});
setUser(null);
   }

   const handleLogin=async ()=>{
    const res=await fetch("http://localhost:8080/api/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        credentials:"include",
        body:JSON.stringify(loginDetails),
    });
    const data=await res.json();

    if(!res.ok){
        alert(data.message||"Login Failed");
        return;
    }

    console.log(data);
    setUser(data.user);
    setAuth(null)
    setLoginDetails({email:"",password:""});
    
    
   }

   


    
    return(
        <>
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
onKeyDown={(e)=>e.key==="Enter"?getReply():""}
></input>
<div id="sumbit" onClick={getReply}><i class="fa-solid fa-paper-plane"></i></div>
</div>

    <p className="info">SigmaGPT can make mistakes. Check important info. See cookie preferences.</p>

</div>
        </div>

        
        </>
    )
}

export default ChatWindow;