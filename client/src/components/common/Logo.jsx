import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'default', showText = true }) => {
  const sizes = {
    small: {
      container: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-lg',
    },
    default: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-xl',
    },
    large: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-2xl',
    },
  };

  const { container, icon, text } = sizes[size] || sizes.default;

  return (
    <Link to="/" className="flex items-center gap-3 group">
      <div className={`
        ${container} rounded-xl 
        bg-gradient-to-br from-primary-500 to-medical-teal 
        flex items-center justify-center
        shadow-soft group-hover:shadow-glow
        transition-all duration-300
      `}>
        <svg viewBox="0 0 24 24" fill="none" className={icon}>
          <path 
            d="M12 2v20M2 12h20" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
      {showText && (
        <div className="hidden sm:block">
          <h1 className={`${text} font-display font-bold`}>
            <span className="text-primary-600">Sugar</span>
            <span className="text-slate-400">&</span>
            <span className="text-medical-teal">Heart</span>
          </h1>
          <p className="text-xs text-slate-500 -mt-0.5">Clinic</p>
        </div>
      )}
    </Link>
  );
};

export default Logo;
