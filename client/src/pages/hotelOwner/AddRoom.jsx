import { useState, useEffect } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'
import { toast } from 'react-hot-toast'
import { 
  Upload, 
  Building, 
  Bed, 
  DollarSign, 
  Wifi, 
  Coffee, 
  ConciergeBell, 
  Mountain, 
  RefreshCw,
  Plus,
  Check,
  Image,
  Waves, // Remplace SwimmingPool
  Utensils // Alternative pour Room Service
} from 'lucide-react'

const AddRoom = () => {
  const { axios, getToken, user, userHotels, refreshUserHotels } = useAppContext()

  const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
  const [inputs, setInputs] = useState({
    roomType: '',
    pricePerNight: 0,
    hotelId: '',
    amenities: {
      'Free Wifi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false
    }
  })
  const [loading, setLoading] = useState(false)
  const [refreshingHotels, setRefreshingHotels] = useState(false)
  const [activeTab, setActiveTab] = useState('details')

  // ✅ DEBUG COMPLET
  useEffect(() => {
    console.log('=== 🏨 ADD ROOM DATA ===')
    console.log('User Hotels from context:', userHotels)
    console.log('User Hotels count:', userHotels?.length)
    console.log('First hotel data:', userHotels?.[0])
    console.log('User role:', user?.role)
    console.log('User ID:', user?._id)
    console.log('=== 🏨 DATA END ===')
  }, [userHotels, user])

  // ✅ FORCER LE CHARGEMENT DES HÔTELS AU DÉMARRAGE
  useEffect(() => {
    const loadHotels = async () => {
      if (user && (user.role === "host" || user.role === "admin")) {
        setRefreshingHotels(true)
        console.log('🔄 Loading hotels on component mount...')
        await refreshUserHotels()
        setRefreshingHotels(false)
      }
    }
    
    loadHotels()
  }, [user])

  // ✅ Vérification améliorée des hôtels
  const hasRealHotels = userHotels && 
                       userHotels.length > 0 && 
                       userHotels[0]._id && 
                       userHotels[0].name &&
                       userHotels[0].city

  // ✅ Sélection automatique du premier hôtel
  useEffect(() => {
    if (hasRealHotels && !inputs.hotelId) {
      console.log('✅ Auto-selecting hotel:', userHotels[0].name)
      setInputs(prev => ({
        ...prev,
        hotelId: userHotels[0]._id
      }))
    }
  }, [userHotels, hasRealHotels])

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    
    if (!inputs.roomType || !inputs.pricePerNight) {
      toast.error("Please fill in room type and price")
      return
    }

    if (!inputs.hotelId || !hasRealHotels) {
      toast.error("Please select a valid hotel first")
      return
    }
    
    if (!Object.values(images).some(image => image)) {
      toast.error("Please upload at least one image")
      return
    }
    
    setLoading(true)
    
    try {
      const token = getToken()
      if (!token || !user) {
        toast.error("Please login first")
        return
      }

      const selectedHotel = userHotels.find(h => h._id === inputs.hotelId)
      console.log("📤 Sending room to hotel:", selectedHotel)

      const formData = new FormData()
      formData.append('roomType', inputs.roomType)
      formData.append('pricePerNight', inputs.pricePerNight)
      formData.append('hotelId', inputs.hotelId)
      formData.append('amenities', JSON.stringify(
        Object.keys(inputs.amenities).filter(key => inputs.amenities[key])
      ))

      Object.keys(images).forEach((key) => {
        if (images[key]) {
          formData.append('images', images[key])
        }
      })

      const { data } = await axios.post('/api/rooms', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (data.success) {
        toast.success(`✅ Room added to ${selectedHotel?.name || 'hotel'} successfully!`) 
        
        // Reset form mais garder le même hôtel
        setInputs(prev => ({
          roomType: '',
          pricePerNight: 0,
          hotelId: prev.hotelId,
          amenities: {
            'Free Wifi': false,
            'Free Breakfast': false,
            'Room Service': false,
            'Mountain View': false,
            'Pool Access': false
          }
        }))
        setImages({ 1: null, 2: null, 3: null, 4: null })
      } else {
        toast.error(data.message || "Failed to create room")
      }

    } catch (error) {
      console.error("❌ Error creating room:", error)
      toast.error(error.response?.data?.message || "Failed to save room")
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fonction pour rafraîchir manuellement
  const handleRefreshHotels = async () => {
    setRefreshingHotels(true)
    console.log('🔄 Manual refresh triggered')
    await refreshUserHotels()
    setRefreshingHotels(false)
    toast.success("Hotels list refreshed")
  }

  // ✅ Icônes pour les amenities - CORRIGÉ
  const amenityIcons = {
    'Free Wifi': Wifi,
    'Free Breakfast': Coffee,
    'Room Service': ConciergeBell, // Ou Utensils
    'Mountain View': Mountain,
    'Pool Access': Waves // Utilise Waves au lieu de SwimmingPool
  }

  // ✅ Compteur d'images uploadées
  const uploadedImagesCount = Object.values(images).filter(img => img !== null).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header avec navigation par onglets */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Room</h1>
              <p className="text-gray-600 mt-2">Create a new room listing for your hotel</p>
            </div>
            
            {/* Navigation par onglets */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              {['details', 'images', 'amenities'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Barre de progression */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Completion</span>
            <span>{Math.round((uploadedImagesCount > 0 ? 25 : 0) + (inputs.roomType ? 25 : 0) + (inputs.pricePerNight > 0 ? 25 : 0) + (inputs.hotelId ? 25 : 0))}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.round((uploadedImagesCount > 0 ? 25 : 0) + (inputs.roomType ? 25 : 0) + (inputs.pricePerNight > 0 ? 25 : 0) + (inputs.hotelId ? 25 : 0))}%` 
              }}
            ></div>
          </div>
        </div>

        <form onSubmit={onSubmitHandler} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Section Hôtel - Toujours visible */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hotel Selection</h3>
                <p className="text-gray-600 text-sm">Choose which hotel to add this room to</p>
              </div>
            </div>

            {refreshingHotels ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                <RefreshCw className="text-blue-500 animate-spin" size={20} />
                <div>
                  <p className="text-blue-800 font-medium">Loading hotels...</p>
                  <p className="text-blue-600 text-sm">Fetching your hotel listings</p>
                </div>
              </div>
            ) : hasRealHotels ? (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <select
                    value={inputs.hotelId}
                    onChange={(e) => setInputs({ ...inputs, hotelId: e.target.value })}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a hotel</option>
                    {userHotels.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name} - {hotel.city}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleRefreshHotels}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check size={16} />
                  <span>Found {userHotels.length} hotel(s) in your account</span>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Building className="text-yellow-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-yellow-800 font-medium">No Hotels Found</p>
                    <p className="text-yellow-600 text-sm mt-1">
                      {userHotels?.length === 0 
                        ? "You don't have any registered hotels. Please register a hotel first."
                        : "Hotels data is not loading properly. Try refreshing."
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contenu dynamique par onglet */}
          <div className="p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bed className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Room Details</h3>
                    <p className="text-gray-600 text-sm">Basic information about the room</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Type *
                    </label>
                    <select
                      value={inputs.roomType}
                      onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!hasRealHotels}
                    >
                      <option value="">Select Room Type</option>
                      <option value="Single Bed">Single Bed</option>
                      <option value="Double Bed">Double Bed</option>
                      <option value="Luxury Room">Luxury Room</option>
                      <option value="Family Suite">Family Suite</option>
                      <option value="Executive Suite">Executive Suite</option>
                      <option value="Presidential Suite">Presidential Suite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Night *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="number"
                        placeholder="0.00"
                        className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={inputs.pricePerNight}
                        onChange={(e) => setInputs({ ...inputs, pricePerNight: e.target.value })}
                        required
                        min="0"
                        step="0.01"
                        disabled={!hasRealHotels}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Image className="text-green-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Room Images</h3>
                    <p className="text-gray-600 text-sm">Upload high-quality photos of the room</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(images).map((key) => {
                    const hasImage = images[key] !== null
                    return (
                      <label 
                        key={key} 
                        htmlFor={`roomImage${key}`}
                        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all ${
                          hasImage 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="aspect-square rounded-xl overflow-hidden">
                          <img
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            src={hasImage ? URL.createObjectURL(images[key]) : assets.uploadArea}
                            alt="Upload preview"
                          />
                        </div>
                        
                        {/* Overlay au survol */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center">
                          {!hasImage && (
                            <div className="text-center p-4">
                              <Upload className="mx-auto text-gray-400 group-hover:text-white mb-2" size={24} />
                              <p className="text-xs text-gray-400 group-hover:text-white">Click to upload</p>
                            </div>
                          )}
                        </div>

                        {/* Badge de statut */}
                        {hasImage && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                            <Check size={12} />
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          id={`roomImage${key}`}
                          hidden
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              setImages({ ...images, [key]: e.target.files[0] })
                            }
                          }}
                        />
                      </label>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Image size={16} />
                  <span>{uploadedImagesCount} of 4 images uploaded</span>
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ConciergeBell className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Room Amenities</h3>
                    <p className="text-gray-600 text-sm">Select the amenities available in this room</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(inputs.amenities).map((amenity, index) => {
                    const IconComponent = amenityIcons[amenity]
                    const isSelected = inputs.amenities[amenity]
                    
                    return (
                      <label 
                        key={index} 
                        className={`relative flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => setInputs({
                            ...inputs,
                            amenities: { ...inputs.amenities, [amenity]: !isSelected }
                          })}
                          className="hidden"
                        />
                        
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-blue-500' : 'bg-gray-200'
                        }`}>
                          <IconComponent 
                            size={20} 
                            className={isSelected ? 'text-white' : 'text-gray-600'} 
                          />
                        </div>
                        
                        <span className={`font-medium ${
                          isSelected ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {amenity}
                        </span>

                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check size={12} />
                          </div>
                        )}
                      </label>
                    )
                  })}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ConciergeBell size={16} />
                  <span>
                    {Object.values(inputs.amenities).filter(Boolean).length} of {Object.keys(inputs.amenities).length} amenities selected
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer avec bouton de soumission */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                {hasRealHotels ? (
                  <div className="flex items-center gap-2">
                    <Check className="text-green-500" size={16} />
                    <span>Ready to create room</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Building className="text-yellow-500" size={16} />
                    <span>Select a hotel first</span>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading || !hasRealHotels}
                className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  loading || !hasRealHotels
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Room
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddRoom