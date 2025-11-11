import { useState } from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

const cities = [
  "Paris", "London", "Rome", "Barcelona", "Amsterdam",
  "Berlin", "Prague", "Vienna", "Budapest", "Lisbon",
  "Madrid", "Athens", "Istanbul", "Dubrovnik", "Florence",
  "New York", "Los Angeles", "Miami", "Las Vegas", "Toronto",
  "Tokyo", "Bangkok", "Singapore", "Seoul", "Hong Kong",
  "Dubai", "Bali", "Kuala Lumpur", "Sydney", "Melbourne",
  "Cape Town", "Marrakech", "Cairo", "Rio de Janeiro", "Buenos Aires"
];

const HotelReg = () => {
  const { 
    setShowHotelReg, 
    getToken, 
    axios, 
    updateUser, // ✅ Récupérer updateUser du contexte
    navigate,   // ✅ Récupérer navigate du contexte
    addUserHotel, // ✅ Récupérer addUserHotel pour mettre à jour les hôtels
    fetchUserHotels // ✅ Récupérer fetchUserHotels
  } = useAppContext();
  
  const [loading, setLoading] = useState(false);
  
  // State for form fields
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        toast.error("Please login first");
        setShowHotelReg(false);
        return;
      }

      console.log("🔄 Sending hotel registration request...");

      const { data } = await axios.post(
        '/api/hotels',
        { name, contact, address, city },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (data?.success) {
        toast.success(data.message || "Hotel registered successfully!");
        
        // ✅ OPTION 1: Si le backend retourne l'utilisateur mis à jour
        if (data.user) {
          updateUser(data.user);
        } 
        // ✅ OPTION 2: Sinon, récupérer les infos utilisateur mises à jour
        else {
          try {
            const userResponse = await axios.get('/api/user/profile', {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (userResponse.data?.success) {
              updateUser(userResponse.data.user);
            }
          } catch (userError) {
            console.warn("Could not fetch updated user profile:", userError);
          }
        }

        // ✅ METTRE À JOUR LA LISTE DES HÔTELS
        if (data.hotel) {
          // Si l'API retourne l'hôtel créé
          addUserHotel(data.hotel);
        } else {
          // Sinon, recharger la liste des hôtels
          fetchUserHotels();
        }
        
        setShowHotelReg(false);
        
        // ✅ Rediriger vers le dashboard owner
        navigate('/owner');
        
        // Reset form
        setName("");
        setContact("");
        setAddress("");
        setCity("");
      } else {
        toast.error(data.message || "Failed to register hotel");
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.code === 'ERR_NETWORK') {
        toast.error("Cannot connect to server. Please make sure the backend is running.");
      } else {
        toast.error(error.response?.data?.message || error.message || "Failed to register hotel");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={() => setShowHotelReg(false)} 
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 overflow-y-auto'
    >
      <form 
        onSubmit={onSubmitHandler} 
        onClick={(e) => e.stopPropagation()}
        className='flex bg-white rounded-xl max-w-4xl w-full max-md:mx-2 shadow-2xl'
      >
        <img 
          src={assets.regImage} 
          alt="reg-image"
          className='w-1/2 rounded-l-xl hidden md:block object-cover'
        />
        <div className='relative flex flex-col items-center md:w-1/2 p-8 md:p-10 overflow-y-auto max-h-[90vh]'>
          <img 
            src={assets.closeIcon} 
            alt="close-icon" 
            className='absolute top-4 right-4 h-5 w-5 cursor-pointer hover:scale-110 transition-transform opacity-60 hover:opacity-100' 
            onClick={() => setShowHotelReg(false)}
          />
          <p className='text-2xl font-semibold mt-6 mb-6'>Register Your Hotel</p>
          
          {/* Hotel name */}
          <div className='w-full mt-4'>
            <label htmlFor='name' className="font-medium text-gray-700 block mb-1">
              Hotel Name *
            </label>
            <input 
              id='name'
              type="text" 
              placeholder="Enter hotel name" 
              className="border border-gray-300 rounded w-full px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-light transition-all" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className='w-full mt-4'>
            <label htmlFor='contact' className="font-medium text-gray-700 block mb-1">
              Phone *
            </label>
            <input 
              id='contact'
              type="tel" 
              placeholder="Enter phone number" 
              className="border border-gray-300 rounded w-full px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-light transition-all" 
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />
          </div>

          {/* Address */}
          <div className='w-full mt-4'>
            <label htmlFor='address' className="font-medium text-gray-700 block mb-1">
              Address *
            </label>
            <input 
              id='address'
              type="text" 
              placeholder="Enter full address" 
              className="border border-gray-300 rounded w-full px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-light transition-all" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Select city dropdown */}
          <div className='w-full mt-4'>
            <label htmlFor="city" className="font-medium text-gray-700 block mb-1">
              City *
            </label>
            <select 
              id="city" 
              className="border border-gray-300 rounded w-full px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-light transition-all bg-white" 
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            >
              <option value="">Select a city</option>
              {cities.map((cityOption) => (
                <option key={cityOption} value={cityOption}>{cityOption}</option>
              ))}
            </select>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className='w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all text-white px-6 py-3 rounded cursor-pointer mt-8 font-medium'
          >
            {loading ? "Registering..." : "Register Hotel"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HotelReg;