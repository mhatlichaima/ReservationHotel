import React, { useEffect, useState } from 'react'
import HotelCard from './HotelCard'
import Title from './Title'
import { useAppContext } from '../context/AppContext'

const RecommendedHotels = () => {
    const { rooms, searchedCities } = useAppContext();
    const [recommended, setRecommended] = useState([]);

    console.log('🔍 RecommendedHotels INTERNATIONAL DEBUG:');
    console.log('- Total rooms:', rooms?.length);
    console.log('- Searched cities (first 5):', searchedCities?.slice(0, 5));
    
    // Afficher les villes des hôtels disponibles
    if (rooms && rooms.length > 0) {
        const availableCities = [...new Set(rooms.map(room => room.hotel?.city).filter(Boolean))];
        console.log('- Available hotel cities:', availableCities);
    }

    const filterHotels = () => {
        // ✅ Vérifications de sécurité
        if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
            console.log('❌ No rooms available');
            setRecommended([]);
            return;
        }

        // ✅ Si pas de villes recherchées, afficher tous les hôtels
        if (!searchedCities || !Array.isArray(searchedCities) || searchedCities.length === 0) {
            console.log('⚠️ No searched cities, showing first 4 rooms');
            setRecommended(rooms.slice(0, 4));
            return;
        }

        console.log('🎯 Filtering hotels...');

        // ✅ Filtrage amélioré pour villes internationales
        const filteredHotels = rooms.filter(room => {
            if (!room || !room.hotel || !room.hotel.city) {
                return false;
            }
            
            const roomCity = room.hotel.city.toLowerCase().trim();
            const match = searchedCities.some(city => 
                city.toLowerCase().trim() === roomCity
            );

            if (match) {
                console.log(`✅ Match found: "${room.hotel.city}" matches searched cities`);
            }

            return match;
        });

        console.log(`🎯 Found ${filteredHotels.length} matching hotels`);
        
        // ✅ Si aucun match, afficher quand même 4 hôtels aléatoires
        if (filteredHotels.length === 0) {
            console.log('⚠️ No matches, showing random 4 hotels');
            setRecommended(rooms.slice(0, 4));
        } else {
            setRecommended(filteredHotels);
        }
    }

    useEffect(() => {
        filterHotels();
    }, [rooms, searchedCities]);

    // ✅ Afficher TOUJOURS quelque chose
    if (!recommended || recommended.length === 0) {
        return (
            <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>
                <Title 
                    title='Featured Hotels' 
                    subTitle='Discover our exceptional properties around the world' 
                />
                <div className="text-center py-10">
                    <p className="text-gray-500">Loading hotels...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-20'>
            <Title 
                title='Recommended Hotels' 
                subTitle='Discover our handpicked selection of exceptional properties around the world, offering unparalleled luxury and unforgettable experiences' 
            />

            <div className='flex flex-wrap items-center justify-center gap-6 mt-20'>
                {recommended.slice(0, 4).map((room, index) => (
                    <HotelCard key={room._id || index} room={room} index={index} />
                ))}
            </div>
        </div>
    )
}

export default RecommendedHotels