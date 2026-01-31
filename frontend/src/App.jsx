import ChatWindow from "./ChatWindow"
import { MyContext, MyProvider } from "./MyContext"
import SideBar from "./SideBar";
import "./App.css"
import {Routes, Route } from "react-router-dom";
import Signup from "./Signup";


function App() {

  


  return (
    <>
    
      <MyProvider>
       
            <div className="main">
 <SideBar/>
      <ChatWindow/>
            </div>
          
  
      </MyProvider>
      
    </>
  )
}

export default App
