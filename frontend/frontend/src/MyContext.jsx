import { createContext, useEffect ,useState} from "react";
import {v1 as uuidv1} from "uuid";

export const MyContext=createContext("");

export  const MyProvider=({children})=>{
const [prompt,setPrompt]=useState("");
  const [reply,setReply]=useState(null);
  const [currThreadId,setCurrentThreadId]=useState(uuidv1());
  const [prevChat,setPrevChat]=useState([]);//store all curr threads
  const [newChat,setNewChat]=useState(true);
  const [allThreads,setAllThreads]=useState([]);
  const [showHistory,setShowHistory]=useState(false);
  const [user,setUser]=useState(null);
  const [toast,setToast]=useState({
    open:false,
    message:null,
    severity:null
  });

  const checkLogin = async () => {
  try {
    const res = await fetch("http://localhost:8080/api/me", {
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
    } else {
      setUser(null);
    }
  } catch (err) {
    setUser(null);
  }
};


      useEffect(()=>{
        checkLogin();
    },[]);

    const showToast=(message,severity)=>{
setToast({open:true,message,severity});
    }

  return(
        <MyContext.Provider value={ {prompt,setPrompt,
    reply,setReply,
    currThreadId,setCurrentThreadId,
    prevChat,setPrevChat,
    newChat,setNewChat,
    allThreads,setAllThreads,
    showHistory,setShowHistory,
    user,setUser,checkLogin,
    toast,setToast,showToast
}
    }>
            {children}
        </MyContext.Provider>
    )
}