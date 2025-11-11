import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { useAppContext } from '../../context/AppContext'

const Navbar = () => {
  const { user, logout } = useAppContext()

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white'>
        <Link to='/'>
          <img src={assets.logo} alt="logo" className='h-9 invert opacity-80'/>
        </Link>
        
        {/* ✅ Remplacement simple de UserButton */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  {user.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm text-gray-700 hidden md:block">
                {user.username}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs">?</span>
            </div>
          )}
        </div>
    </div>
  )
}

export default Navbar