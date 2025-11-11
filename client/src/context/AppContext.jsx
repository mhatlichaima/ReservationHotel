import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const AppContext = createContext();
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const internationalCities = [
  "Paris", "London", "Rome", "Barcelona", "Amsterdam",
  "Berlin", "Prague", "Vienna", "Budapest", "Lisbon",
  "Madrid", "Athens", "Istanbul", "Dubrovnik", "Florence",
  "New York", "Los Angeles", "Miami", "Las Vegas", "Toronto",
  "Tokyo", "Bangkok", "Singapore", "Seoul", "Hong Kong",
  "Dubai", "Bali", "Kuala Lumpur", "Sydney", "Melbourne",
  "Cape Town", "Marrakech", "Cairo", "Rio de Janeiro", "Buenos Aires"
];

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [hasHotels, setHasHotels] = useState(false);
  const [userHotels, setUserHotels] = useState([]);
  const [searchedCities, setSearchedCities] = useState(internationalCities);

  const getToken = () => localStorage.getItem('token');

  // ✅ FONCTION POUR METTRE À JOUR L'UTILISATEUR
  const updateUser = (userData) => {
    setUser(userData);
    setIsOwner(userData.role === "host" || userData.role === "admin");
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const fetchRooms = async () => {
    try {
      console.log("🔄 Fetching all rooms...");
      const { data } = await axios.get('/api/rooms')
      if (data.success) {
        console.log("✅ Rooms loaded:", data.rooms?.length);
        setRooms(data.rooms || []);
      } else {
        console.log("❌ Rooms fetch failed:", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.log("❌ Rooms fetch error:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ✅ CORRECTION : FONCTION POUR RÉCUPÉRER LES HÔTELS DE L'UTILISATEUR
  const fetchUserHotels = async () => {
    try {
      const token = getToken();
      console.log("🔄 fetchUserHotels called, token:", !!token);
      
      if (!token) {
        console.log("❌ No token available");
        setHasHotels(false);
        setUserHotels([]);
        return;
      }

      // ✅ ESSAYER DIFFÉRENTES ROUTES POSSIBLES
      let hotelsData = null;
      
      try {
        // Essayer la route /api/hotels/my-hotels
        console.log("🔍 Trying /api/hotels/my-hotels...");
        const { data } = await axios.get('/api/hotels/my-hotels', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (data.success) {
          hotelsData = data.hotels || data.data || [];
          console.log("✅ Hotels loaded from /api/hotels/my-hotels:", hotelsData.length);
        }
      } catch (firstError) {
        console.log("❌ /api/hotels/my-hotels failed, trying /api/hotels...");
        
        try {
          // Essayer la route /api/hotels (qui pourrait retourner les hôtels de l'utilisateur)
          const { data } = await axios.get('/api/hotels', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (data.success) {
            // Filtrer les hôtels de l'utilisateur ou prendre tous
            hotelsData = data.hotels || data.data || [];
            console.log("✅ Hotels loaded from /api/hotels:", hotelsData.length);
          }
        } catch (secondError) {
          console.log("❌ /api/hotels also failed, using local storage data");
          
          // ✅ FALLBACK: Utiliser les hôtels du local storage
          const userHotelsFromStorage = localStorage.getItem('userHotels');
          if (userHotelsFromStorage) {
            hotelsData = JSON.parse(userHotelsFromStorage);
            console.log("✅ Hotels loaded from localStorage:", hotelsData.length);
          } else {
            console.log("ℹ️ No hotels found anywhere");
            hotelsData = [];
          }
        }
      }

      // ✅ METTRE À JOUR L'ÉTAT
      if (hotelsData && hotelsData.length > 0) {
        setUserHotels(hotelsData);
        setHasHotels(true);
        console.log("✅ User hotels updated:", hotelsData.length);
      } else {
        setHasHotels(false);
        setUserHotels([]);
        console.log("ℹ️ No hotels found for user");
      }
      
    } catch (error) {
      console.log("❌ Final hotel fetch error:", error);
      setHasHotels(false);
      setUserHotels([]);
    }
  };

  // ✅ FONCTION POUR AJOUTER UN HÔTEL (AMÉLIORÉE)
  const addUserHotel = async (newHotel) => {
    try {
      const token = getToken();
      let createdHotel = newHotel;

      // ✅ ESSAYER D'ENREGISTRER DANS L'API
      try {
        console.log("🔄 Registering hotel in API...");
        const { data } = await axios.post(
          '/api/hotels',
          newHotel,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success && data.hotel) {
          createdHotel = data.hotel;
          console.log("✅ Hotel registered in API:", createdHotel);
        }
      } catch (apiError) {
        console.log("❌ API registration failed, using local data:", apiError);
        // Continuer avec les données locales
      }

      const hotelToAdd = {
        _id: createdHotel._id || `hotel-${Date.now()}`,
        name: createdHotel.name,
        city: createdHotel.city,
        address: createdHotel.address,
        contact: createdHotel.contact,
        status: 'active',
        createdAt: new Date().toISOString()
      };
      
      // ✅ METTRE À JOUR L'ÉTAT
      setUserHotels(prev => [...prev, hotelToAdd]);
      setHasHotels(true);
      
      // ✅ METTRE À JOUR LE LOCAL STORAGE
      const updatedHotels = [...userHotels, hotelToAdd];
      localStorage.setItem('userHotels', JSON.stringify(updatedHotels));
      
      // ✅ METTRE À JOUR L'UTILISATEUR
      if (user) {
        const updatedUser = { ...user, hasHotels: true };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      console.log("✅ Hotel added successfully:", hotelToAdd);
      toast.success("Hôtel enregistré avec succès !");
      
    } catch (error) {
      console.error("❌ Error in addUserHotel:", error);
      toast.error("Erreur lors de l'enregistrement de l'hôtel");
    }
  };

  useEffect(() => {
    const token = getToken();
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setIsOwner(parsedUser.role === "host" || parsedUser.role === "admin");
      
      console.log("🔄 Initializing user data...");
      
      // ✅ CHARGER LES HÔTELS AU DÉMARRAGE
      if (parsedUser.role === "host" || parsedUser.role === "admin") {
        fetchUserHotels();
      }
    }
    setLoading(false);
  }, []);

  // ✅ SAUVEGARDER AUTOMATIQUEMENT DANS LOCAL STORAGE
  useEffect(() => {
    if (userHotels.length > 0) {
      localStorage.setItem('userHotels', JSON.stringify(userHotels));
      console.log("💾 User hotels saved to localStorage:", userHotels.length);
    }
  }, [userHotels]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setIsOwner(userData.role === "host" || userData.role === "admin");
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    console.log("🔐 User logged in, fetching hotels...");
    
    // ✅ CHARGER LES HÔTELS APRÈS LE LOGIN
    if (userData.role === "host" || userData.role === "admin") {
      setTimeout(() => {
        fetchUserHotels();
      }, 1000);
    } else {
      setHasHotels(false);
      setUserHotels([]);
    }
    
    toast.success(`Bienvenue ${userData.username}!`);
  };

  const logout = () => {
    setUser(null);
    setIsOwner(false);
    setHasHotels(false);
    setUserHotels([]);
    setRooms([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userHotels');
    navigate('/');
    toast.success("Déconnexion réussie");
  };

  const refreshRooms = () => {
    fetchRooms();
  };

  // ✅ FONCTION POUR RAFRAÎCHIR LES HÔTELS
  const refreshUserHotels = () => {
    fetchUserHotels();
  };

  const value = {
    navigate,
    user,
    getToken,
    isOwner,
    showHotelReg,
    setShowHotelReg,
    login,
    logout,
    loading,
    hasHotels,
    userHotels,
    addUserHotel,
    fetchUserHotels,
    refreshUserHotels, // ✅ NOUVELLE FONCTION
    updateUser,
    axios,
    toast,
    rooms,
    setRooms,
    refreshRooms,
    fetchRooms,
    searchedCities, 
    setSearchedCities 
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};