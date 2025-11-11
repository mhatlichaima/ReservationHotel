import React from "react";
import Navbar from "./components/Navbar";
import { useAppContext } from "./context/AppContext";
import { Route ,Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import HotelReg from "./components/HotelReg";
import Layout from "./pages/hotelOwner/Layout";
import ListRoom from "./pages/hotelOwner/ListRoom";
import AddRoom from "./pages/hotelOwner/AddRoom";
import Dashboard from "./pages/hotelOwner/Dashboard";
import {Toaster} from "react-hot-toast";
import Chatbot from './components/Chatbot';
import UserProfile from './pages/UserProfile'; // ✅ IMPORTANT - Ajoutez cette importation

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");
  const { showHotelReg } = useAppContext();
  
  return (
    <div>
      <Toaster/>
      
      {/* Navigation - cachée sur les pages owner */}
      {!isOwnerPath && <Navbar /> } 
      
      {/* Modal d'enregistrement d'hôtel */}
      {showHotelReg && <HotelReg/>}
      
      {/* Contenu principal */}
      <div className='min-h-[70vh]'>
        <Routes>
          <Route path='/' element={<Home /> } />
          <Route path='/rooms' element={<AllRooms/>}  /> 
          <Route path='/rooms/:id' element={<RoomDetails/>}  /> 
          <Route path='/my-bookings' element={<MyBookings/>}  /> 
          
          {/* ✅ ROUTE PROFIL UTILISATEUR - AJOUTÉE */}
          <Route path='/profile' element={<UserProfile/>}  /> 
          
          <Route path='/owner' element={<Layout/>}>
            <Route index element={<Dashboard/>}/>
            <Route path="add-room" element={<AddRoom/>}/>
            <Route path="list-room" element={<ListRoom/>}/>
          </Route>
        </Routes>
      </div>
      
      {/* Footer - caché sur les pages owner */}
      {!isOwnerPath && <Footer/>}
      
      {/* ✅ CHATBOT INTÉGRÉ - visible sur toutes les pages sauf owner */}
      {!isOwnerPath && <Chatbot />}
    </div>
  )
}

export default App;