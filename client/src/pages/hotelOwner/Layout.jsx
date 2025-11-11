import { Outlet } from 'react-router-dom'
import Navbar from '../../components/hotelOwner/Navbar'
import Sidebar from '../../components/hotelOwner/Sidebar'
import { useEffect } from 'react'
import { useAppContext } from '../../context/AppContext' // ✅ IMPORT MANQUANT

const Layout = () => {
  const { isOwner, navigate } = useAppContext() // ✅ MAINTENANT DÉFINI
  
  useEffect(() => {
    if (!isOwner) {
      navigate('/')
    }
  }, [isOwner, navigate])

  return (
    <div className='flex flex-col h-screen bg-gray-50'>
      <Navbar/>
      <div className='flex flex-1 overflow-hidden'>
        <Sidebar/>
        <div className='flex-1 p-6 overflow-auto'>
          <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default Layout