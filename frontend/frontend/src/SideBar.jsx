import { useContext, useEffect } from "react";
import "./SideBar.css";
import blacklogo from "./assets/blacklogo.png";
import { MyContext } from "./MyContext";
import {v1 as uuidv1} from "uuid";

function SideBar(){
    const {allThreads,setAllThreads,currThreadId,setNewChat,setPrompt,setReply,setPrevChat,setCurrentThreadId,showHistory,user,showToast}=useContext(MyContext);
console.log(user);

    const getAllThreads=async()=>{
        if(!user){
setAllThreads([]);
return;
        }

        try{
const response=await fetch("https://sigmagpt-wb5m.onrender.com/api/thread",{
    credentials:"include",
});
const res=await response.json();

const filteredData=res.map((thread)=>({threadId:thread.threadId,title:thread.title}));
//console.log(filteredData);
setAllThreads(filteredData);
        }catch(err){
            console.log(err);
           
        }

    }

    useEffect(()=>{
getAllThreads();
    },[user,currThreadId])

    const createNewChat=()=>{
setPrompt(""),
setReply(null),
setNewChat(true),
setPrevChat([]),
setCurrentThreadId(uuidv1());
    }

    const changeThread=async (newthreadId)=>{
        setCurrentThreadId(newthreadId);
        try{
const response=await fetch(`https://sigmagpt-wb5m.onrender.com/api/thread/${newthreadId}`,{
    credentials:"include"}
);
console.log(response);
const res=await response.json();
if(!response.ok){
    showToast(res.message||"error");
}
console.log("res"+res);
setPrevChat(res);
setNewChat(false);
setReply(null);

        }catch(err){
console.log(err);
showToast(err.message,"error");
        }
    }

    const deleteThread=async(deleteThreadId)=>{

try{
const response=await fetch(`https://sigmagpt-wb5m.onrender.com/api/thread/${deleteThreadId}`,{method:"DELETE",credentials:"include"});
const data=await response.json();

setAllThreads(prev=>prev.filter(thread=>thread.threadId!==deleteThread));

if(deleteThreadId===currThreadId){
    createNewChat();
}

if(response.ok){
showToast("Thread deleted successfully","success");
}else{
    showToast(data.message||"something went wrong","error");
}

}catch(err){
    console.log(err);
}
    }

    useEffect(()=>{
        if(!user){
            setAllThreads([]);
        }
    },[user]);
    return(
        <>
        <section className={`sidebar ${showHistory?"show":""}`}>
            <button onClick={createNewChat}>
                <img src={blacklogo} alt="gpt logo" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i>
               
                </span>
            </button>

            <ul className="history">
               {
                allThreads?.map((thread,idx)=>(
                    <li key={idx} onClick={(e)=>changeThread(thread.threadId)}
                    className={thread.threadId===currThreadId?"highlighted":""}>
                        {thread.title} <i class="fa-solid fa-trash"
                        onClick={(e)=>{
                            e.stopPropagation(),//event bubling
                        deleteThread(thread.threadId)}}></i>
                        </li>
                ))
               }
            </ul>

            <div className="sign">
<p>By Komal Mahajan  &hearts;</p>
            </div>
        </section>
        </>
    )
}

export default SideBar;