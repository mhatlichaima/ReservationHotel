import React from "react";
import Navbar from "./components/Navbar";
import { Route ,Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import AllRooms from "./pages/AllRooms";

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner"); // Check if the current path includes "owner"
  return (
    <div>
      {!isOwnerPath && <Navbar /> }  
      {/* Render Navbar only if not on an "owner" path */}
      <div className='min-h-[70vh]'>
        <Routes>
        <Route path='/' element={<Home /> } />
        <Route path='/rooms' element={<AllRooms/>}  /> 
        
      </Routes>

      </div>
      <Footer/>
    </div>
  )
}
export default App