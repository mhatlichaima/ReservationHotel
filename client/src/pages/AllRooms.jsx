import React, { useMemo, useState } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { useAppContext } from '../context/AppContext'

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
      <input 
        type='checkbox' 
        checked={selected} 
        onChange={(e) => onChange(e.target.checked, label)}
        className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
      />
      <span className='font-light select-none'>{label}</span>
    </label>
  )
}

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
      <input 
        type='radio' 
        name="sortOption" 
        checked={selected} 
        onChange={(e) => onChange(label)}
        className='w-4 h-4 text-blue-600 focus:ring-blue-500'
      />
      <span className='font-light select-none'>{label}</span>
    </label>
  )
}

const AllRooms = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { rooms, navigate, currency } = useAppContext()
  
  const [openFilters, setOpenFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    roomTypes: [],
    priceRanges: [],
  })
  const [selectedSort, setSelectedSort] = useState('')

  const roomTypes = [
    "Single Bed",
    "Double Bed",
    "Luxury Room",
    "Family Suite",
  ]

  const priceRanges = [
    '0 to 500',
    '500 to 1000',
    '1000 to 2000',
    '2000 to 3000',
  ]

  const sortOptions = [
    "Price Low to High",
    "Price High to Low",
    "Newest First",
  ]
  
  // Handle changes for filters and sorting
  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters }
      if (checked) {
        updatedFilters[type].push(value)
      } else {
        updatedFilters[type] = updatedFilters[type].filter(item => item !== value)
      }
      return updatedFilters
    })
  }
  
  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption)
  }

  // Function to check if a room matches the selected room types 
  const matchesRoomType = (room) => {
    return selectedFilters.roomTypes.length === 0 || 
           selectedFilters.roomTypes.includes(room.roomType)
  }

  // Function to check if a room matches the selected price ranges
  const matchesPriceRange = (room) => {
    return selectedFilters.priceRanges.length === 0 || 
           selectedFilters.priceRanges.some(range => {
             const [min, max] = range.split(' to ').map(Number)
             return room.pricePerNight >= min && room.pricePerNight <= max
           })
  }

  // Function to sort rooms based on the selected sort option 
  const sortRooms = (a, b) => {
    if (selectedSort === 'Price Low to High') {
      return a.pricePerNight - b.pricePerNight
    }
    if (selectedSort === 'Price High to Low') {
      return b.pricePerNight - a.pricePerNight
    }
    if (selectedSort === 'Newest First') {
      return new Date(b.createdAt) - new Date(a.createdAt)
    }
    return 0
  }

  // Filter destination 
  const filterDestination = (room) => {
    const destination = searchParams.get('destination')
    if (!destination) return true
    return room.hotel?.city?.toLowerCase().includes(destination.toLowerCase()) ||
           room.hotel?.name?.toLowerCase().includes(destination.toLowerCase())
  }

  // Filter and sort rooms based on the selected filters and sort options
  const filteredRooms = useMemo(() => {
    return rooms
      .filter(room => matchesRoomType(room) && matchesPriceRange(room) && filterDestination(room))
      .sort(sortRooms)
  }, [rooms, selectedFilters, selectedSort, searchParams])

  // Clear all filters 
  const clearFilters = () => {
    setSelectedFilters({
      roomTypes: [],
      priceRanges: [],
    })
    setSelectedSort('')
    setSearchParams({})
  }

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32 gap-8'>
      {/* Rooms List */}
      <div className='flex-1'>
        <div className='flex flex-col items-start text-left mb-8'>
          <h1 className='font-playfair text-4xl md:text-[40px] text-gray-800'>Hotel Rooms</h1>
          <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-2xl'>
            Take advantage of our limited-time offers and special packages to 
            enhance your stay and create unforgettable memories.
          </p>
          <p className='text-gray-600 mt-2'>
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredRooms.length === 0 ? (
          <div className='text-center py-12'>
            <div className='text-gray-400 text-6xl mb-4'>🏨</div>
            <h3 className='text-xl font-semibold text-gray-600 mb-2'>No rooms found</h3>
            <p className='text-gray-500'>Try adjusting your filters or search criteria</p>
            <button 
              onClick={clearFilters}
              className='mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors'
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <div key={room._id} className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:border-0'>
              <img 
                onClick={() => { 
                  navigate(`/rooms/${room._id}`)
                  window.scrollTo(0, 0)
                }}
                src={room.images?.[0] || assets.uploadArea} 
                alt={room.roomType}
                title='View Room Details' 
                className='w-full md:w-1/2 h-64 md:h-80 rounded-xl shadow-lg object-cover cursor-pointer transition-transform hover:scale-105' 
              />
              <div className='md:w-1/2 flex flex-col gap-3'>
                <p className='text-gray-500 text-sm uppercase tracking-wide'>{room.hotel?.city || 'Unknown City'}</p>
                <p 
                  onClick={() => { 
                    navigate(`/rooms/${room._id}`)
                    window.scrollTo(0, 0)
                  }} 
                  className='text-gray-800 text-2xl md:text-3xl font-playfair cursor-pointer hover:text-blue-600 transition-colors'
                >
                  {room.hotel?.name || 'Unknown Hotel'}
                </p>
                <div className='flex items-center'>
                  <StarRating rating={room.rating} />
                  <p className='ml-2 text-gray-600 text-sm'>{room.reviewCount || '0'} reviews</p>
                </div>
                <div className='flex items-center gap-1 text-gray-500 text-sm'>
                  <img src={assets.locationIcon} alt="location-icon" className='w-4 h-4' />
                  <span>{room.hotel?.address || 'Address not available'}</span>
                </div>
                
                {/* Room Amenities */}
                <div className='flex flex-wrap items-center mt-3 mb-4 gap-2'>
                  {room.amenities?.slice(0, 4).map((item, index) => (
                    <div key={index} className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100'>
                      <img 
                        src={facilityIcons[item] || assets.uploadArea} 
                        alt={item}
                        className='w-4 h-4' 
                      />
                      <p className='text-xs text-blue-700'>
                        {item}
                      </p>
                    </div>
                  ))}
                  {room.amenities?.length > 4 && (
                    <span className='text-xs text-gray-500 ml-1'>
                      +{room.amenities.length - 4} more
                    </span>
                  )}
                </div>
                
                {/* Room Price per night */}
                <div className='flex justify-between items-center mt-auto'>
                  <p className='text-xl font-semibold text-gray-800'>
                    {room.pricePerNight} <span className='text-sm font-normal text-gray-600'>/night</span>
                  </p>
                  <button 
                    onClick={() => { 
                      navigate(`/rooms/${room._id}`)
                      window.scrollTo(0, 0)
                    }}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors'
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Filters Sidebar */}
      <div className='bg-white w-full lg:w-80 border border-gray-300 rounded-lg sticky top-32'>
        <div className='flex items-center justify-between px-5 py-4 border-b border-gray-300'>
          <p className='text-lg font-semibold text-gray-800'>Filters</p>
          <div className='flex gap-4 text-sm'>
            <button 
              onClick={clearFilters}
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              Clear All
            </button>
            <button 
              onClick={() => setOpenFilters(!openFilters)}
              className='lg:hidden text-gray-600 hover:text-gray-800'
            >
              {openFilters ? 'HIDE' : 'SHOW'}
            </button>
          </div>
        </div>
        
        <div className={`${openFilters ? 'block' : 'hidden lg:block'} transition-all duration-300`}>
          {/* Room Types */}
          <div className='px-5 pt-5 pb-4 border-b border-gray-200'>
            <p className='font-medium text-gray-800 pb-3'>Room Types</p>
            {roomTypes.map((roomType, index) => (
              <CheckBox 
                key={index} 
                label={roomType} 
                selected={selectedFilters.roomTypes.includes(roomType)} 
                onChange={(checked) => handleFilterChange(checked, roomType, 'roomTypes')}
              />
            ))}
          </div>
          
          {/* Price Range */}
          <div className='px-5 pt-5 pb-4 border-b border-gray-200'>
            <p className='font-medium text-gray-800 pb-3'>Price Range</p>
            {priceRanges.map((range, index) => (
              <CheckBox 
                key={index} 
                label={`${range}`} 
                selected={selectedFilters.priceRanges.includes(range)} 
                onChange={(checked) => handleFilterChange(checked, range, 'priceRanges')}
              />
            ))}
          </div>
          
          {/* Sort Options */}
          <div className='px-5 pt-5 pb-6'>
            <p className='font-medium text-gray-800 pb-3'>Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton 
                key={index} 
                label={option} 
                selected={selectedSort === option} 
                onChange={handleSortChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllRooms