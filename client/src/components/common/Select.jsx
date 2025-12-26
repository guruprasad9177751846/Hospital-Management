import React, { forwardRef } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

const Select = forwardRef(({
  label,
  options = [],
  placeholder = 'Select...',
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="label">{label}</label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`
            input appearance-none cursor-pointer pr-10
            ${error ? 'input-error' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <HiChevronDown className="w-5 h-5" />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
