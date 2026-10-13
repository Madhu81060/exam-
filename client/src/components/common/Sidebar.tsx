import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  ShieldAlert,
  Heart,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin } = useAuth();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/projects',
      label: 'Projects',
      icon: FolderKanban,
    },
    {
      to: '/tasks',
      label: 'Tasks & Board',
      icon: CheckSquare,
    },
    {
      to: '/team',
      label: 'Team Members',
      icon: Users,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-rose-100 p-4">
      {/* Mobile close button */}
      <div className="flex items-center justify-between pb-4 lg:hidden border-b border-rose-100 mb-2">
        <span className="text-sm font-bold text-rose-600">Menu</span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-rose-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1.5 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-pink-500/20 font-semibold'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/70'
                }`
              }
            >
              <Icon className="w-4 h-4 mr-3 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Info Card */}
      <div className="mt-auto pt-4 border-t border-rose-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50/50 border border-rose-100 text-xs">
          <div className="flex items-center space-x-1.5 font-semibold text-rose-700">
            <Heart className="w-3.5 h-3.5 fill-rose-500 stroke-rose-500 animate-pulse" />
            <span>Pink & White Edition</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
            Role-Based Project Management System
          </p>
          <div className="mt-2 text-[10px] text-rose-400 font-mono">
            Active Role: <span className="font-bold text-rose-600">{user?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (static) */}
      <aside className="hidden lg:block w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
