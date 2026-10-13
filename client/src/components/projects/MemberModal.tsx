import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { User } from '../../types';
import { userApi } from '../../api/user.api';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (userId: string, role: string) => Promise<void>;
  existingMemberUserIds: string[];
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  existingMemberUserIds,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      userApi
        .getUsers()
        .then((res) => {
          const available = res.data.users.filter(
            (u) => !existingMemberUserIds.includes(u.id)
          );
          setUsers(available);
          if (available.length > 0) {
            setSelectedUserId(available[0].id);
          } else {
            setSelectedUserId('');
          }
        })
        .catch(() => {});
      setError(null);
    }
  }, [isOpen, existingMemberUserIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setError('Please select a user to add');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAddMember(selectedUserId, role);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Project Member" maxWidth="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Select User
          </label>
          {users.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-2 bg-rose-50/40 rounded-xl">
              All registered users are already members of this project.
            </p>
          ) : (
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role}) - {u.email}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Project Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-rose-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all"
          >
            <option value="MEMBER">Member</option>
            <option value="MANAGER">Manager</option>
          </select>
        </div>

        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-rose-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-rose-50/60 hover:bg-rose-100/60 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || users.length === 0}
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-md shadow-pink-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
