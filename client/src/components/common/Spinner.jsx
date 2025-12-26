import React from 'react';

const Spinner = ({ size = 'default', className = '' }) => {
  const sizes = {
    small: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes[size]}
          rounded-full border-primary-500 border-t-transparent
          animate-spin
        `}
      />
    </div>
  );
};

export default Spinner;
