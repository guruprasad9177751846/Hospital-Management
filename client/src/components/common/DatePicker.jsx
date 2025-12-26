import React from 'react';
import { HiOutlineCalendarDays } from 'react-icons/hi2';
import { format } from 'date-fns';

const DatePicker = ({ 
  value, 
  onChange, 
  label,
  min,
  max,
  className = '' 
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const displayValue = value 
    ? format(new Date(value + 'T00:00:00'), 'dd MMM yyyy')
    : 'Select date';

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="label">{label}</label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <HiOutlineCalendarDays className="w-5 h-5" />
        </div>
        <input
          type="date"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          className="input pl-10 cursor-pointer"
        />
        <div className="absolute inset-0 flex items-center pl-10 pointer-events-none sm:hidden">
          <span className="text-slate-700">{displayValue}</span>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
