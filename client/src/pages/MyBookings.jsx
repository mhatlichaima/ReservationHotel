import Title from "../components/Title"
import { assets } from '../assets/assets'
import { useEffect, useState } from "react"
import { useAppContext } from '../context/AppContext'
import { useSearchParams } from "react-router-dom"
import toast from "react-hot-toast"

const MyBookings = () => {
    const { axios: api, getToken, user } = useAppContext()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(false)
    const [processingPayment, setProcessingPayment] = useState(null)
    const [verifyingPayments, setVerifyingPayments] = useState({})
    const [searchParams] = useSearchParams()

    const fetchUserBooking = async () => {
        setLoading(true)
        try {
            const token = await getToken()
            const { data } = await api.get('/api/bookings/user', {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (data.success) {
                setBookings(data.bookings || [])
                console.log("📊 Bookings chargés:", data.bookings?.length)
                
                // Log détaillé pour debug
                data.bookings?.forEach(booking => {
                    console.log(`📋 ${booking._id}: isPaid=${booking.isPaid}, session=${booking.stripeSessionId ? 'YES' : 'NO'}`)
                })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Erreur fetch bookings:", error)
            toast.error("Failed to load bookings")
        } finally {
            setLoading(false)
        }
    }

    // ✅ VÉRIFICATION PAR SESSION ID DIRECT
    const checkPaymentBySession = async (sessionId, bookingId) => {
        console.log("🔄 Vérification par session directe...")
        setVerifyingPayments(prev => ({ ...prev, [bookingId]: true }))
        
        try {
            const token = await getToken()
            const { data } = await api.post('/api/bookings/check-payment-by-session', 
                { sessionId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            console.log("📨 Réponse vérification session:", data)
            
            if (data.success) {
                if (data.isPaid) {
                    toast.success("🎉 Payment confirmed! Updating...")
                    // Rafraîchir les données
                    setTimeout(() => {
                        fetchUserBooking()
                    }, 1500)
                } else {
                    toast.error(`Payment status: ${data.paymentStatus}`)
                }
            } else {
                toast.error(data.message || "Verification failed")
            }
        } catch (error) {
            console.error("❌ Erreur vérification session:", error)
            toast.error("Session verification error")
        } finally {
            setVerifyingPayments(prev => ({ ...prev, [bookingId]: false }))
        }
    }

    // ✅ VÉRIFICATION FORCÉE - AMÉLIORÉE
    const forceCheckPayment = async (bookingId) => {
        console.log("🔧 Vérification forcée pour:", bookingId)
        setVerifyingPayments(prev => ({ ...prev, [bookingId]: true }))
        
        try {
            const token = await getToken()
            
            // 1. Récupérer les bookings pour avoir la sessionId
            const bookingsResponse = await api.get('/api/bookings/user', {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            const currentBooking = bookingsResponse.data.bookings?.find(b => b._id === bookingId)
            
            if (!currentBooking) {
                toast.error("Booking not found")
                return
            }

            // 2. Si on a une sessionId, utiliser la vérification directe
            if (currentBooking.stripeSessionId) {
                console.log("🎯 Session trouvée:", currentBooking.stripeSessionId)
                await checkPaymentBySession(currentBooking.stripeSessionId, bookingId)
                return
            }

            // 3. Si pas de sessionId, essayer la vérification normale
            console.log("⚠️ Pas de sessionId, tentative de vérification normale...")
            const { data } = await api.post('/api/bookings/force-check-payment', 
                { bookingId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            if (data.success) {
                if (data.isPaid) {
                    toast.success("✅ Payment verified!")
                    fetchUserBooking()
                } else {
                    toast.error(data.message || "Payment not completed")
                }
            } else {
                toast.error(data.message || "Verification failed")
            }
            
        } catch (error) {
            console.error("❌ Erreur vérification forcée:", error)
            toast.error("Force check failed")
        } finally {
            setVerifyingPayments(prev => ({ ...prev, [bookingId]: false }))
        }
    }

    // 🎯 DÉTECTION AUTOMATIQUE AU CHARGEMENT - AMÉLIORÉE
    useEffect(() => {
        const paymentSuccess = searchParams.get('payment_success')
        const sessionId = searchParams.get('session_id')
        const bookingId = searchParams.get('booking_id')
        
        if (paymentSuccess === 'true' && sessionId && bookingId) {
            console.log("✅ RETOUR STRIPE DÉTECTÉ")
            console.log("Session ID:", sessionId)
            console.log("Booking ID:", bookingId)
            
            // Sauvegarder en localStorage pour debug
            localStorage.setItem('lastStripeSession', sessionId)
            localStorage.setItem('lastBookingId', bookingId)
            
            toast.loading("Verifying payment...", { duration: 3000 })
            
            // Vérification AUTOMATIQUE avec sessionId direct
            setTimeout(() => {
                checkPaymentBySession(sessionId, bookingId)
            }, 2000)
            
            // Nettoyer l'URL
            window.history.replaceState({}, '', '/my-bookings')
        }
        
        // Vérifier s'il y a des sessions sauvegardées
        const savedSession = localStorage.getItem('lastStripeSession')
        const savedBooking = localStorage.getItem('lastBookingId')
        if (savedSession && savedBooking && !paymentSuccess) {
            console.log("🔄 Session sauvegardée trouvée - Vérification...")
            checkPaymentBySession(savedSession, savedBooking)
            localStorage.removeItem('lastStripeSession')
            localStorage.removeItem('lastBookingId')
        }
    }, [searchParams])

    const handlePayment = async (bookingId) => {
        setProcessingPayment(bookingId)
        try {
            const token = await getToken()
            const { data } = await api.post('/api/bookings/stripe-payment',
                { bookingId }, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
            
            if (data.success) {
                console.log("🔗 Redirection vers Stripe - Session:", data.sessionId)
                
                // ✅ SAUVEGARDER POUR VÉRIFICATION FUTURE
                localStorage.setItem('lastStripeSession', data.sessionId)
                localStorage.setItem('lastBookingId', bookingId)
                
                window.location.href = data.url
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error("Payment error:", error)
            toast.error("Payment failed")
        } finally {
            setProcessingPayment(null)
        }
    }

    // Chargement initial
    useEffect(() => {
        if (user) {
            fetchUserBooking()
        }
    }, [user])

    return (
        <div className='py-28 md:pb-35 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32'>
            <Title 
                title='My Bookings' 
                subTitle='Easily manage your past, current, and upcoming hotel reservations in one place. Plan your trips seamlessly with just a few clicks' 
                align='left'
            />
            
            <div className="flex justify-between items-center mb-4">
                <button 
                    onClick={fetchUserBooking}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                    🔄 Refresh All
                </button>
                <div className="text-sm text-gray-600">
                    {bookings.filter(b => !b.isPaid).length} unpaid booking(s)
                </div>
            </div>
            
            <div className="max-w-6xl mt-8 w-full text-gray-800">
                {bookings.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No bookings found</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking._id} className="grid grid-cols-1 md:grid-cols-[3fr_2fr_1fr] w-full border-b border-gray-300 py-6 gap-4">
                            
                            {/* Hotel Details */}
                            <div className='flex flex-col md:flex-row gap-4'>
                                <img 
                                    src={booking.room?.images?.[0]} 
                                    alt="hotel"
                                    className='w-full md:w-44 h-32 md:h-44 rounded-lg shadow-md object-cover'
                                />
                                <div className='flex flex-col gap-2'>
                                    <p className='font-playfair text-xl md:text-2xl'>
                                        {booking.hotel?.name}
                                        <span className='font-inter text-sm ml-2'>({booking.room?.roomType})</span>
                                    </p>
                                    <p className='text-base font-semibold text-gray-800'>
                                        Total: {booking.totalPrice}DT
                                    </p>
                                    {/* ✅ AFFICHAGE DE LA SESSION POUR DEBUG */}
                                    {booking.stripeSessionId && (
                                        <p className="text-xs text-green-600">
                                            ✓ Session: {booking.stripeSessionId.substring(0, 15)}...
                                        </p>
                                    )}
                                    {!booking.stripeSessionId && !booking.isPaid && (
                                        <p className="text-xs text-orange-600">
                                            ⚠️ No session saved
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {/* Date & Timings */}
                            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
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
                            
                            {/* ✅ SECTION PAIEMENT ULTIME */}
                            <div className='flex flex-col items-center justify-center gap-3'>
                                <div className='flex items-center gap-2'>
                                    <div className={`h-3 w-3 rounded-full ${booking.isPaid ? "bg-green-500" : "bg-red-500"}`}></div>
                                    <p className={`text-sm font-semibold ${booking.isPaid ? "text-green-600" : "text-red-600"}`}>
                                        {booking.isPaid ? "Paid" : "Unpaid"}
                                    </p>
                                </div>
                                
                                {!booking.isPaid && (
                                    <div className="flex flex-col gap-2 items-center">
                                        <button 
                                            onClick={() => handlePayment(booking._id)} 
                                            disabled={processingPayment === booking._id}
                                            className='px-8 py-2.5 text-sm bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 disabled:opacity-50'
                                        >
                                            {processingPayment === booking._id ? "Redirecting..." : "Pay Now"}
                                        </button>
                                        
                                        {/* ✅ BOUTON VÉRIFICATION AMÉLIORÉ */}
                                        <button 
                                            onClick={() => forceCheckPayment(booking._id)}
                                            disabled={verifyingPayments[booking._id]}
                                            className={`px-4 py-1 text-xs rounded hover:bg-purple-600 disabled:opacity-50 ${
                                                booking.stripeSessionId 
                                                    ? 'bg-purple-500 text-white' 
                                                    : 'bg-gray-400 text-gray-200'
                                            }`}
                                        >
                                            {verifyingPayments[booking._id] ? "🔄 Checking..." : "🔍 Check Payment"}
                                        </button>
                                    </div>
                                )}

                                {booking.isPaid && booking.paymentDate && (
                                    <p className="text-xs text-green-600 text-center">
                                        ✅ Paid on {new Date(booking.paymentDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default MyBookings