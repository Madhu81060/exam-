import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from './RoleBadge';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-sm shadow-pink-100/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand + Hamburger */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 lg:hidden transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  PinkSync
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-rose-400 -mt-1">
                  Team Management
                </span>
              </div>
            </Link>
          </div>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-2xl hover:bg-rose-50/80 border border-transparent hover:border-rose-100 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-pink-200 border border-rose-200 flex items-center justify-center text-rose-700 font-bold text-sm shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-slate-800 leading-tight">
                      {user.name}
                    </div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </div>
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-pink-900/10 border border-rose-100 py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-4 py-3 border-b border-rose-50">
                        <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-800 truncate mt-0.5">
                          {user.name}
                        </p>
                        <div className="mt-1.5">
                          <RoleBadge role={user.role} />
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
