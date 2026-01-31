import ChatWindow from "./ChatWindow"
import {  MyProvider } from "./MyContext"
import SideBar from "./SideBar";
import "./App.css"



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
