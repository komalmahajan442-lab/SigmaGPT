import { useContext, useEffect, useState } from "react";
import "./Chat.css"
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat(){

    const {prevChat,newChat,reply}=useContext(MyContext);
    const [latestReply,setLatestReply]=useState(null);

    useEffect(()=>{
        if(reply===null){
setLatestReply(null);
return;
        }
if(!prevChat?.length) return;

const content=reply.split(" ");
 let idx=0;
const interval=setInterval(()=>{
setLatestReply(content.slice(0,idx+1).join(" "));
idx++;

if(idx>=content.length) clearInterval(interval);

},40);

return ()=>clearInterval(interval);
    },[prevChat,reply])
    return(
        <>
{
newChat && <h1>Start New Chat!</h1>
}

<div className="chats">
    {
        prevChat?.slice(0,-1).map((chat,idx)=>(
            <div className={chat.role=="user"?"userdiv":"gptdiv"} key={idx}>
                {chat.role=="user"?
                <p className="usermsg">{chat.content}</p>:
                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                }
            </div>
        ))
    }

    {prevChat.length>0 &&
    <>{
    latestReply !== null?
    <div className="gptdiv" key={"typing"}>
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>  
    </div>:
        <div className="gptdiv" key={"non-typing"}>
      <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{prevChat[prevChat.length-1].content}</ReactMarkdown>  
    </div>
}
    </>
    }
</div>

        </>
    )
}

export default Chat;