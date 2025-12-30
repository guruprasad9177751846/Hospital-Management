import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiOutlineClipboardDocumentCheck,
  HiOutlineMapPin,
  HiOutlineClipboardDocumentList,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineBuildingOffice2
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    {
      label: 'Daily Checklist',
      path: '/',
      icon: HiOutlineClipboardDocumentCheck,
      roles: ['admin', 'staff']
    },
    {
      label: 'My Records',
      path: '/records',
      icon: HiOutlineDocumentText,
      roles: ['admin', 'staff']
    },
    {
      label: 'Hospitals',
      path: '/hospitals',
      icon: HiOutlineBuildingOffice2,
      roles: ['admin']
    },
    {
      label: 'Areas',
      path: '/areas',
      icon: HiOutlineMapPin,
      roles: ['admin']
    },
    {
      label: 'Tasks',
      path: '/tasks',
      icon: HiOutlineClipboardDocumentList,
      roles: ['admin']
    },
    {
      label: 'Users',
      path: '/users',
      icon: HiOutlineUsers,
      roles: ['admin']
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: HiOutlineChartBar,
      roles: ['admin']
    }
  ];

  const filteredNavItems = navItems.filter(item => 
    isAdmin ? item.roles.includes('admin') : item.roles.includes('staff')
  );

  return (
    <aside className="hidden lg:block w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-slate-200/50">
      <nav className="p-4 space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
              transition-all duration-200
              ${isActive 
                ? 'bg-gradient-to-r from-primary-500/10 to-medical-teal/10 text-primary-600 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }
            `}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

