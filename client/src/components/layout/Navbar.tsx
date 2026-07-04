import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Globe, User, ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-[#e2006a] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SB</span>
          </div>
          <span className="font-bold text-lg text-[#e2006a] hidden sm:block">Supply Buddy</span>
        </Link>

        {/* Location */}
        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#e2006a] transition-colors">
          <MapPin size={14} className="text-[#e2006a]" />
          <span className="hidden md:block">Select delivery area</span>
          <ChevronDown size={14} />
        </button>

        {/* Nav tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/suppliers" className="hover:text-[#e2006a] transition-colors">Suppliers</Link>
          <Link to="/materials" className="hover:text-[#e2006a] transition-colors">Materials</Link>
          {profile?.role === 'supplier' && (
            <Link to="/supplier/dashboard" className="hover:text-[#e2006a] transition-colors">Dashboard</Link>
          )}
          {profile?.role === 'admin' && (
            <Link to="/admin" className="hover:text-[#e2006a] transition-colors">Admin</Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button className="hidden md:flex items-center gap-1 text-sm text-gray-600">
            <Globe size={16} />
            <span>EN</span>
            <ChevronDown size={14} />
          </button>

          {profile ? (
            <>
              <button className="text-gray-600 hover:text-[#e2006a] transition-colors">
                <Heart size={20} />
              </button>
              <Link to="/cart" className="relative text-gray-600 hover:text-[#e2006a] transition-colors">
                <ShoppingCart size={20} />
                {items.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#e2006a] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {items.length}
                  </span>
                )}
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium text-gray-700">
                  <User size={18} />
                  <span className="hidden sm:block">{profile.full_name.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 w-44 hidden group-hover:block border border-gray-100">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                  <Link to="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Bookings</Link>
                  <hr className="my-1" />
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-[#e2006a]">Login</Link>
              <Link to="/signup" className="bg-[#e2006a] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#b8005a] transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
