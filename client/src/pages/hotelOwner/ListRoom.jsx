import { useEffect, useState } from 'react'
import Title from '../../components/Title'
import { useAppContext } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { 
  BarChart, Bar, PieChart, Pie, Cell, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts'
import {
  RefreshCw,
  Building,
  Bed,
  DollarSign,
  Eye,
  Edit3,
  Trash2,
  Filter,
  Search,
  ChevronDown,
  X,
  BarChart3,
  PieChart as PieChartIcon,
  Grid3X3,
  List
} from 'lucide-react'

const ListRoom = () => {
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid', 'list', 'charts'
  const [filters, setFilters] = useState({
    search: '',
    hotel: '',
    availability: '',
    priceRange: '',
    sortBy: 'name'
  })
  const { axios, getToken, user } = useAppContext()

  // Couleurs pour les graphiques
  const CHART_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']

  // Fetch ALL rooms of the hotel owner from ALL hotels
  const fetchRooms = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      
      const { data } = await axios.get('/api/rooms/owner/all', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      if (data.success) {
        setRooms(data.rooms || [])
        setFilteredRooms(data.rooms || [])
        
        if (data.stats) {
          toast.success(`Found ${data.stats.totalRooms} rooms in ${data.stats.totalHotels} hotels`)
        }
      } else {
        toast.error(data.message || 'Failed to fetch rooms')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch rooms')
    } finally {
      setLoading(false)
    }
  }

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...rooms]
    
    // Filtre par recherche
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(room => 
        room.roomType?.toLowerCase().includes(searchTerm) ||
        room.hotel?.name?.toLowerCase().includes(searchTerm) ||
        room.hotel?.city?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Filtre par hôtel
    if (filters.hotel) {
      filtered = filtered.filter(room => room.hotel?._id === filters.hotel)
    }
    
    // Filtre par disponibilité
    if (filters.availability === 'available') {
      filtered = filtered.filter(room => room.isAvailable)
    } else if (filters.availability === 'unavailable') {
      filtered = filtered.filter(room => !room.isAvailable)
    }
    
    // Filtre par prix
    if (filters.priceRange === '0-100') {
      filtered = filtered.filter(room => room.pricePerNight <= 100)
    } else if (filters.priceRange === '100-200') {
      filtered = filtered.filter(room => room.pricePerNight > 100 && room.pricePerNight <= 200)
    } else if (filters.priceRange === '200+') {
      filtered = filtered.filter(room => room.pricePerNight > 200)
    }
    
    // Tri
    if (filters.sortBy === 'price_low') {
      filtered.sort((a, b) => a.pricePerNight - b.pricePerNight)
    } else if (filters.sortBy === 'price_high') {
      filtered.sort((a, b) => b.pricePerNight - a.pricePerNight)
    } else if (filters.sortBy === 'hotel') {
      filtered.sort((a, b) => (a.hotel?.name || '').localeCompare(b.hotel?.name || ''))
    } else {
      // Tri par nom par défaut
      filtered.sort((a, b) => a.roomType.localeCompare(b.roomType))
    }
    
    setFilteredRooms(filtered)
  }, [rooms, filters])

  // Toggle availability of the room
  const toggleAvailability = async (roomId) => {
    try {
      const { data } = await axios.post('/api/rooms/toggle-availability', 
        { roomId },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        }
      )
      if (data.success) {
        toast.success(data.message)
        fetchRooms()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // Delete room
  const deleteRoom = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        const { data } = await axios.delete(`/api/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        })
        if (data.success) {
          toast.success('Room deleted successfully')
          fetchRooms()
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || error.message)
      }
    }
  }

  // Données pour les graphiques
  const roomTypeDistribution = () => {
    const types = {}
    rooms.forEach(room => {
      types[room.roomType] = (types[room.roomType] || 0) + 1
    })
    return Object.entries(types).map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }))
  }

  const hotelDistribution = () => {
    const hotels = {}
    rooms.forEach(room => {
      const hotelName = room.hotel?.name || 'Unknown Hotel'
      hotels[hotelName] = (hotels[hotelName] || 0) + 1
    })
    return Object.entries(hotels).map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }))
  }

  const priceDistribution = () => {
    const ranges = {
      '0-100': 0,
      '100-200': 0,
      '200-300': 0,
      '300+': 0
    }
    
    rooms.forEach(room => {
      const price = room.pricePerNight
      if (price <= 100) ranges['0-100']++
      else if (price <= 200) ranges['100-200']++
      else if (price <= 300) ranges['200-300']++
      else ranges['300+']++
    })
    
    return Object.entries(ranges).map(([name, value], index) => ({
      name: `$${name}`,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      hotel: '',
      availability: '',
      priceRange: '',
      sortBy: 'name'
    })
  }

  const hasActiveFilters = filters.search || filters.hotel || filters.availability || filters.priceRange

  useEffect(() => {
    if (user) {
      fetchRooms()
    }
  }, [user])

  // Liste unique des hôtels pour le filtre
  const uniqueHotels = [...new Set(rooms.map(room => room.hotel?._id).filter(Boolean))]
    .map(id => rooms.find(room => room.hotel?._id === id)?.hotel)
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Title 
          align='left' 
          font='outfit' 
          title='Room Management' 
          subTitle='View, edit, or manage all rooms across all your hotels. Keep the information up-to-date to provide the best experience for users.'
        />
        
        {/* Header avec contrôles */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Room Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive overview of all your room listings</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Mode de vue */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List size={18} />
                </button>
                <button
                  onClick={() => setViewMode('charts')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'charts' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart3 size={18} />
                </button>
              </div>

              <button 
                onClick={fetchRooms}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-medium"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <RefreshCw size={18} />
                )}
                Refresh
              </button>
            </div>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search rooms..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            <select
              value={filters.hotel}
              onChange={(e) => setFilters({...filters, hotel: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Hotels</option>
              {uniqueHotels.map(hotel => (
                <option key={hotel._id} value={hotel._id}>
                  {hotel.name}
                </option>
              ))}
            </select>

            <select
              value={filters.availability}
              onChange={(e) => setFilters({...filters, availability: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>

            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Prices</option>
              <option value="0-100">$0 - $100</option>
              <option value="100-200">$100 - $200</option>
              <option value="200+">$200+</option>
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="hotel">Sort by Hotel</option>
            </select>
          </div>

          {/* Filtres actifs */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                  Search: "{filters.search}"
                  <button onClick={() => setFilters({...filters, search: ''})}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.hotel && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  Hotel: {uniqueHotels.find(h => h._id === filters.hotel)?.name}
                  <button onClick={() => setFilters({...filters, hotel: ''})}>
                    <X size={12} />
                  </button>
                </span>
              )}
              {filters.availability && (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                  {filters.availability === 'available' ? 'Available' : 'Unavailable'}
                  <button onClick={() => setFilters({...filters, availability: ''})}>
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Rooms</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{rooms.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Bed className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Available</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {rooms.filter(room => room.isAvailable).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Eye className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Hotels</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {[...new Set(rooms.map(room => room.hotel?._id))].length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Building className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Avg. Price</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  ${rooms.length > 0 ? Math.round(rooms.reduce((sum, room) => sum + room.pricePerNight, 0) / rooms.length) : 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <DollarSign className="text-orange-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Contenu selon le mode de vue */}
        {viewMode === 'charts' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Distribution par type de chambre */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Type Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomTypeDistribution()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {roomTypeDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Distribution par hôtel */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hotelDistribution()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : null}

        {/* Liste/Grille des chambres */}
        {viewMode !== 'charts' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {filteredRooms.length} Room{filteredRooms.length !== 1 ? 's' : ''} Found
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {hasActiveFilters ? 'Filtered results' : 'All rooms across your hotels'}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <RefreshCw className="animate-spin text-blue-500 mx-auto mb-3" size={32} />
                  <p className="text-gray-600">Loading all rooms from your hotels...</p>
                </div>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center py-12">
                <Bed className="text-gray-400 mx-auto mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                <p className="text-gray-600 mb-4">
                  {hasActiveFilters 
                    ? 'No rooms match your current filters. Try adjusting your search criteria.'
                    : "You haven't added any rooms to your hotels yet."
                  }
                </p>
                {!hasActiveFilters && (
                  <button 
                    onClick={() => window.location.href = '/owner/add-room'}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-colors font-medium"
                  >
                    Add Your First Room
                  </button>
                )}
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <div key={room._id} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative">
                      {room.images && room.images.length > 0 ? (
                        <img
                          src={room.images[0]}
                          alt={room.roomType}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Bed className="text-gray-400" size={48} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            onChange={() => toggleAvailability(room._id)} 
                            type="checkbox" 
                            className='sr-only peer' 
                            checked={room.isAvailable}
                          />
                          <div className='relative w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200'>
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                              room.isAvailable ? 'translate-x-6' : 'translate-x-0'
                            }`}></span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">{room.roomType}</h4>
                        <span className="text-2xl font-bold text-blue-600">${room.pricePerNight}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Building size={14} />
                        <span>{room.hotel?.name}</span>
                      </div>

                      {/* Équipements */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {room.amenities?.slice(0, 3).map((amenity, i) => (
                          <span 
                            key={i} 
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                        {room.amenities?.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{room.amenities.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                          <Edit3 size={14} className="inline mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteRoom(room._id)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                        >
                          <Trash2 size={14} className="inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Mode liste
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase">Room Type</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase">Hotel</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase">Amenities</th>
                      <th className="py-4 px-6 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                      <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="py-4 px-6 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRooms.map((room) => (
                      <tr key={room._id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{room.roomType}</div>
                          {room.images && room.images.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {room.images.length} image(s)
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-blue-600">{room.hotel?.name}</div>
                          <div className="text-xs text-gray-500">{room.hotel?.city}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {room.amenities?.slice(0, 2).map((amenity, i) => (
                              <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {amenity}
                              </span>
                            ))}
                            {room.amenities?.length > 2 && (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                +{room.amenities.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">${room.pricePerNight}</span>
                          <span className="text-gray-500 text-xs ml-1">/night</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center">
                            <label className="inline-flex items-center cursor-pointer">
                              <input 
                                onChange={() => toggleAvailability(room._id)} 
                                type="checkbox" 
                                className='sr-only peer' 
                                checked={room.isAvailable}
                              />
                              <div className='relative w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200'>
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                                  room.isAvailable ? 'translate-x-6' : 'translate-x-0'
                                }`}></span>
                              </div>
                            </label>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center gap-2">
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                              Edit
                            </button>
                            <button 
                              onClick={() => deleteRoom(room._id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ListRoom