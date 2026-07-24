import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Globe, User, ChevronDown, MapPin, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { DELIVERY_AREAS, useDeliveryArea } from '../../context/DeliveryAreaContext';
import type { DeliveryArea } from '../../context/DeliveryAreaContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Language } from '../../context/LanguageContext';

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'বাংলা' },
];

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const { items } = useCart();
  const { area, setArea } = useDeliveryArea();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [areaMenuOpen, setAreaMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const areaMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  function selectArea(next: DeliveryArea | null) {
    setArea(next);
    setAreaMenuOpen(false);
  }

  function selectLanguage(next: Language) {
    setLanguage(next);
    setLangMenuOpen(false);
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (areaMenuRef.current && !areaMenuRef.current.contains(e.target as Node)) {
        setAreaMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

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
        <div className="relative" ref={areaMenuRef}>
          <button
            onClick={() => setAreaMenuOpen(o => !o)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#e2006a] transition-colors"
          >
            <MapPin size={14} className="text-[#e2006a]" />
            <span className="hidden md:block">{area ? t(`area.${area}`) : t('nav.selectDeliveryArea')}</span>
            <ChevronDown size={14} />
          </button>
          {areaMenuOpen && (
            <div className="absolute left-0 top-8 bg-white shadow-lg rounded-lg py-2 w-48 border border-gray-100 z-50">
              <button
                onClick={() => selectArea(null)}
                className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {t('nav.allAreas')}
                {area === null && <Check size={14} className="text-[#e2006a]" />}
              </button>
              <hr className="my-1" />
              {DELIVERY_AREAS.map(a => (
                <button
                  key={a}
                  onClick={() => selectArea(a)}
                  className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t(`area.${a}`)}
                  {area === a && <Check size={14} className="text-[#e2006a]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/suppliers" className="hover:text-[#e2006a] transition-colors">{t('nav.suppliers')}</Link>
          <Link to="/materials" className="hover:text-[#e2006a] transition-colors">{t('nav.materials')}</Link>
          {profile?.role === 'supplier' && (
            <Link to="/supplier/dashboard" className="hover:text-[#e2006a] transition-colors">{t('nav.dashboard')}</Link>
          )}
          {profile?.role === 'admin' && (
            <Link to="/admin" className="hover:text-[#e2006a] transition-colors">{t('nav.admin')}</Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block" ref={langMenuRef}>
            <button
              onClick={() => setLangMenuOpen(o => !o)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#e2006a] transition-colors"
            >
              <Globe size={16} />
              <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
              <ChevronDown size={14} />
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 top-8 bg-white shadow-lg rounded-lg py-2 w-32 border border-gray-100 z-50">
                {LANGUAGE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => selectLanguage(opt.value)}
                    className="flex items-center justify-between w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    {opt.label}
                    {language === opt.value && <Check size={14} className="text-[#e2006a]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{t('nav.myProfile')}</Link>
                  <Link to="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{t('nav.myBookings')}</Link>
                  <hr className="my-1" />
                  <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                    {t('nav.signOut')}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-[#e2006a]">{t('nav.login')}</Link>
              <Link to="/signup" className="bg-[#e2006a] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#b8005a] transition-colors">
                {t('nav.signUp')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
