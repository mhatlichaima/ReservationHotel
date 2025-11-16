import React from "react";
import Navbar from "./components/Navbar";
import { useAppContext } from "./context/AppContext";
import { Route, Routes, useLocation } from "react-router-dom";
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
import { Toaster } from "react-hot-toast";
import Chatbot from './components/Chatbot';
import UserProfile from './pages/UserProfile';
import { Loader as LucideLoader } from "lucide-react"; // ✅ Renommer l'import
import RecommendationsPage from "./pages/RecommendationsPage";
import { RecommendationProvider } from "./context/RecommendationContext";

// ✅ Composant Loader personnalisé pour la route
const LoaderPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LucideLoader className="animate-spin h-12 w-12 mx-auto text-blue-600" />
      <p className="text-gray-600 mt-3">Chargement...</p>
    </div>
  </div>
);

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("owner");
  const { showHotelReg } = useAppContext();
  
  return (
    <RecommendationProvider>
      <div>
        <Toaster/>
        
        {/* Navigation - cachée sur les pages owner */}
        {!isOwnerPath && <Navbar />} 
        
        {/* Modal d'enregistrement d'hôtel */}
        {showHotelReg && <HotelReg/>}
        
        {/* Contenu principal */}
        <div className='min-h-[70vh]'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/rooms' element={<AllRooms/>} /> 
            <Route path='/rooms/:id' element={<RoomDetails/>} /> 
            <Route path='/my-bookings' element={<MyBookings/>} /> 
            <Route path='/loader/:nextUrl' element={<LoaderPage/>} /> {/* ✅ Utiliser LoaderPage */}

            {/* ✅ ROUTE RECOMMANDATIONS */}
            <Route path='/recommendations' element={<RecommendationsPage/>} /> 

            {/* ✅ ROUTE PROFIL UTILISATEUR */}
            <Route path='/profile' element={<UserProfile/>} /> 
            
            <Route path='/owner' element={<Layout/>}>
              <Route index element={<Dashboard/>}/>
              <Route path="add-room" element={<AddRoom/>}/>
              <Route path="list-room" element={<ListRoom/>}/>
            </Route>
          </Routes>
        </div>
        
        {/* Footer - caché sur les pages owner */}
        {!isOwnerPath && <Footer/>}
        
        {/* ✅ CHATBOT INTÉGRÉ */}
        {!isOwnerPath && <Chatbot />}
      </div>
    </RecommendationProvider>
  );
}

export default App;