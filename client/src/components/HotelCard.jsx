import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'

const HotelCard = ({ room, index, isBestSeller = false }) => {
  // ✅ Vérification PLUS STRICTE des données
  if (!room || !room._id || !room.hotel) {
    console.warn('❌ HotelCard: Données manquantes ou invalides', { room, index })
    return null // Ne rien afficher si données invalides
  }

  // ✅ Vérifications sécurisées pour chaque propriété
  const roomId = room._id
  const roomImages = room.images || [assets.room_default]
  const mainImage = roomImages[0] || assets.room_default
  const hotel = room.hotel
  const hotelName = hotel.name || 'Hôtel sans nom'
  const hotelAddress = hotel.address || 'Adresse non disponible'
  const pricePerNight = room.pricePerNight || room.price || 0
  const rating = hotel.rating || 4.5 // Utiliser le rating réel de l'hôtel si disponible

  const handleImageError = (e) => {
    e.target.src = assets.room_default
  }

  return (
    <Link 
      to={`/rooms/${roomId}`} 
      onClick={() => window.scrollTo(0, 0)} 
      className='relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300'
    >
      {/* Image avec fallback */}
      <div className='w-full h-48 overflow-hidden'>
        <img 
          src={mainImage} 
          alt={hotelName} 
          className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
          onError={handleImageError}
        />
      </div>
      
      {/* ✅ Badge Best Seller conditionnel BASÉ SUR LES DONNÉES RÉELLES */}
      {isBestSeller && (
        <p className='px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full'>
          Best Seller
        </p>
      )}
      
      {/* Contenu */}
      <div className='p-4 pt-5'>
        <div className='flex items-center justify-between'>
          <p className='font-playfair text-xl font-medium text-gray-800 line-clamp-1'>
            {hotelName}
          </p>
          <div className='flex items-center gap-1'>
            <img src={assets.starIconFilled} alt="star-icon" />
            {rating}
          </div>
        </div>
        
        <div className='flex items-center gap-1 text-sm mt-2'>
          <img src={assets.locationIcon} alt="location-icon" /> 
          <span className='line-clamp-1'>{hotelAddress}</span>
        </div>
        
        <div className='flex items-center justify-between mt-4'>
          <p>
            <span className='text-xl text-gray-800'>{pricePerNight}DT</span> / night
          </p>
          <button 
            className='px-4 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-all cursor-pointer'
            onClick={(e) => e.preventDefault()}
          >
            Book now
          </button>
        </div>
      </div>
    </Link>
  )
}

export default HotelCard