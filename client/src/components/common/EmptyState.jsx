import React from 'react';
import { HiOutlineInbox } from 'react-icons/hi2';

const EmptyState = ({ 
  icon: Icon = HiOutlineInbox,
  title = 'No data found',
  description = 'There is no data to display.',
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 text-center max-w-sm mb-4">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
