import React from 'react';

const Toggle = ({ checked, onChange, disabled = false, size = 'default', label }) => {
  const sizes = {
    small: {
      track: 'h-5 w-10',
      knob: 'h-3 w-3',
      translate: 'translate-x-5',
      padding: 'left-1',
    },
    default: {
      track: 'h-7 w-14',
      knob: 'h-5 w-5',
      translate: 'translate-x-7',
      padding: 'left-1',
    },
    large: {
      track: 'h-8 w-16',
      knob: 'h-6 w-6',
      translate: 'translate-x-8',
      padding: 'left-1',
    },
  };

  const { track, knob, translate, padding } = sizes[size] || sizes.default;

  return (
    <label className="inline-flex items-center gap-3 cursor-pointer">
      <span className={`text-sm font-medium transition-colors ${checked ? 'text-slate-400' : 'text-slate-700'}`}>
        No
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex ${track} items-center rounded-full 
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${checked 
            ? 'bg-gradient-to-r from-primary-500 to-medical-teal shadow-glow' 
            : 'bg-slate-300 hover:bg-slate-400'
          }
        `}
      >
        <span
          className={`
            ${padding} absolute ${knob} transform rounded-full bg-white shadow-md
            transition-transform duration-300 ease-out
            ${checked ? translate : 'translate-x-0'}
          `}
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${checked ? 'text-primary-600' : 'text-slate-400'}`}>
        Yes
      </span>
      {label && <span className="ml-2 text-sm text-slate-600">{label}</span>}
    </label>
  );
};

export default Toggle;

