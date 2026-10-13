import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, Filter, CheckCircle2, AlertCircle } from 'lucide-react';
import { userApi } from '../api/user.api';
import { User, UserRole } from '../types';
import { RoleBadge } from '../components/common/RoleBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useAuth } from '../context/AuthContext';

export const TeamManagement: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await userApi.getUsers({
        role: roleFilter || undefined,
        search: searchQuery || undefined,
      });
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch team members', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    try {
      await userApi.updateUserRole(targetUserId, newRole);
      setSuccessMsg(`User role updated to ${newRole}`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Team Members & Permissions
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Directory of registered team members and role-based permissions matrix
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role Permission Reference Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm shadow-pink-100/30">
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <h4 className="text-xs font-bold text-slate-800 uppercase">Administrator</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Full governance across all workspace projects, tasks, user directory, and role assignments.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm shadow-pink-100/30">
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
            <h4 className="text-xs font-bold text-slate-800 uppercase">Project Manager</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Can create projects, assign team members, and direct task lifecycles for authorized projects.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-sm shadow-pink-100/30">
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <h4 className="text-xs font-bold text-slate-800 uppercase">Team Member</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Can view assigned projects, update task statuses, and post comments on their active work.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm shadow-pink-100/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-rose-50/30 border border-rose-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
          />
        </form>

        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2 px-3 bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 text-slate-700"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="PROJECT_MANAGER">Project Manager</option>
            <option value="TEAM_MEMBER">Team Member</option>
          </select>
        </div>
      </div>

      {/* Users Table / Card Grid */}
      {isLoading ? (
        <LoadingSpinner size="lg" label="Loading team members..." />
      ) : users.length === 0 ? (
        <EmptyState
          title="No team members match criteria"
          description="Try modifying your search or role filter."
          icon={<Users className="w-7 h-7" />}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/50 border-b border-rose-100 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Assigned Tasks</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  {isAdmin && <th className="py-3.5 px-6 text-right">Role Management</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-rose-50/20 transition-colors">
                    {/* User info */}
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-200 to-pink-200 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.name.charAt(0)}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-6">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Assigned Tasks count */}
                    <td className="py-4 px-6 font-medium">
                      {u._count?.tasksAssigned || 0} tasks
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-slate-400">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>

                    {/* Role dropdown (Admins only) */}
                    {isAdmin && (
                      <td className="py-4 px-6 text-right">
                        {u.id === currentUser?.id ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Current Session
                          </span>
                        ) : (
                          <select
                            value={u.role}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value as UserRole)
                            }
                            className="text-xs py-1.5 px-2.5 bg-rose-50/60 border border-rose-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 font-semibold text-rose-700 cursor-pointer"
                          >
                            <option value="TEAM_MEMBER">Team Member</option>
                            <option value="PROJECT_MANAGER">Project Manager</option>
                            <option value="ADMIN">Administrator</option>
                          </select>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
