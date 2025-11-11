import Title from "../components/Title"
import { assets } from '../assets/assets'
import { useEffect, useState } from "react"
import {useAppContext} from '../context/AppContext'
import toast from "react-hot-toast"

const MyBookings = () => {
    const{axios, getToken, user}= useAppContext()
    const [bookings, setBookings] = useState([])
    const fetchUserBooking = async ()=>{
        try{
            const { data } = await axios.get('/api/bookings/user',{headers:{
                Authorization: `Bearer ${await getToken()}`}})
                if(data.success){
                    setBookings(data.bookings)
                }else{
                    toast.error(data.message)
                }
        }catch(error){
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(user){
            fetchUserBooking()
        }
    },[user])

    
    return (
        <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
            <Title 
                title='My Bookings' 
                subTitle='Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks' 
                align='left'
            />
            
            <div className="max-w-6xl mt-8 w-full text-gray-800">
                {/* Table Header - Hidden on mobile */}
                <div className="hidden md:grid md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 font-medium text-base py-3">
                    <div>Hotels</div>
                    <div>Date & Timings</div>
                   <div className="text-center">Payment</div> 
                </div>
        
                {/* Bookings List */}
                {bookings.map((booking) => (
                    <div 
                        key={booking._id} 
                        className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 first:border-t gap-4"
                    >
                        {/* Hotel Details */}
                        <div className='flex flex-col md:flex-row gap-4'>
                            <img 
                                src={booking.room.images[0]} 
                                alt="hotel-img"
                                className='w-full md:w-44 h-32 md:h-44 rounded-lg shadow-md object-cover'
                            />
                            
                            <div className='flex flex-col gap-2'>
                                <p className='font-playfair text-xl md:text-2xl'>
                                    {booking.hotel.name}
                                    <span className='font-inter text-sm ml-2'>
                                        ({booking.room.roomType})
                                    </span>
                                </p>
                                
                                <div className='flex items-center gap-2 text-sm text-gray-500'>
                                    <img src={assets.locationIcon} alt="location-icon" className='w-4 h-4'/>
                                    <span>{booking.hotel.address}</span>
                                </div>

                                <div className='flex items-center gap-2 text-sm text-gray-500'>
                                    <img src={assets.guestsIcon} alt="guests-icon" className='w-4 h-4'/>
                                    <span>Guests: {booking.guests}</span>
                                </div>
                                
                                <p className='text-base font-semibold text-gray-800 mt-1'>
                                    Total: {booking.totalPrice}DT
                                </p>
                            </div>
                        </div>
                        
                        {/* Date & Timings */}
                        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8 mt-3 md:mt-0">
                            <div>
                                <p className="font-medium">Check-In:</p>
                                <p className="text-gray-500 text-sm">
                                    {new Date(booking.checkInDate).toDateString()}
                                </p>
                            </div>
                            
                            <div>
                                <p className="font-medium">Check-Out:</p>
                                <p className="text-gray-500 text-sm">
                                    {new Date(booking.checkOutDate).toDateString()}
                                </p>
                            </div>
                        </div>
                        
                     {/* Payment */}
<div className='flex flex-col items-center justify-center gap-3 mt-3 md:mt-0'>
    <div className='flex items-center gap-2'>
        <div className={`h-3 w-3 rounded-full flex-shrink-0 ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`}></div>
        <p className={`text-sm font-semibold ${booking.isPaid ? "text-green-600" : "text-red-600"}`}>
            {booking.isPaid ? "Paid" : "Unpaid"}
        </p>
    </div>
    
    {!booking.isPaid && (
        <button className='px-8 py-2.5 text-sm bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md'>
            Pay Now
        </button>
    )}
</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyBookings