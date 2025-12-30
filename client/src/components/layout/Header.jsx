import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineUser, 
  HiOutlineArrowRightOnRectangle,
  HiChevronDown,
  HiOutlineShieldCheck,
  HiOutlineBuildingOffice2
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get hospital info from user
  const hospitalLogo = user?.hospital?.logoUrl;
  const hospitalName = user?.hospital?.name || 'Daily Checklist';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Hospital Logo & Name */}
          <div className="flex items-center gap-3">
            {hospitalLogo ? (
              <img 
                src={hospitalLogo} 
                alt={hospitalName}
                className="h-10 w-auto max-w-[120px] object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-medical-teal flex items-center justify-center ${hospitalLogo ? 'hidden' : ''}`}>
              <HiOutlineBuildingOffice2 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-display font-bold text-slate-800">{hospitalName}</h1>
              <p className="text-xs text-slate-500">Daily Checklist System</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover shadow-soft"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={`w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-medical-teal flex items-center justify-center text-white font-semibold text-sm shadow-soft ${user?.profilePicture ? 'hidden' : ''}`}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  {isAdmin && <HiOutlineShieldCheck className="w-3 h-3 text-primary-500" />}
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </p>
              </div>
              <HiChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="dropdown">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="dropdown-item"
                  >
                    <HiOutlineUser className="w-4 h-4 mr-3 text-slate-400" />
                    Profile
                  </button>
                </div>
                <div className="py-1 border-t border-slate-100">
                  <button
                    onClick={handleLogout}
                    className="dropdown-item text-red-600 hover:bg-red-50"
                  >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4 mr-3" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

