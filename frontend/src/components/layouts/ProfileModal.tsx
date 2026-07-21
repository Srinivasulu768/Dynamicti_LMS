import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Key, Eye, EyeOff, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ROLE_LABELS } from '@/constants/roles';
import toast from 'react-hot-toast';

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
  'America/Los_Angeles', 'Europe/London', 'Europe/Paris',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
  'Australia/Sydney',
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timezone, setTimezone] = useState('America/New_York');

  if (!user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Password changed successfully!');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gold-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-navy-900 font-bold text-lg">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{ROLE_LABELS[user.role]}</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 py-3 px-1 mr-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-gold-500 text-gold-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex items-center gap-2 py-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-gold-500 text-gold-500'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Key className="w-4 h-4" />
                Change Password
              </button>
            </div>

            {/* Tab Content */}
            <div className="px-6 py-5">
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      defaultValue={`${user.firstName} ${user.lastName}`}
                      placeholder="Full name"
                    />
                    <Input
                      label="Email"
                      type="email"
                      defaultValue={user.email}
                      placeholder="Email address"
                    />
                  </div>
                  <Input
                    label="Mobile Number"
                    defaultValue={user.phone || ''}
                    placeholder="e.g. +1-555-0000"
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Timezone</label>
                    <select
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-800/20 bg-white"
                    >
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      This affects how all dates and times are displayed across the app.
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.success('Timezone saved!');
                      }}
                    >
                      Save Timezone
                    </Button>
                    <Button type="submit" variant="gold" size="sm">
                      <Save className="w-4 h-4 mr-1" /> Save Profile
                    </Button>
                  </div>
                </form>
              )}

              {activeTab === 'password' && (
                <form onSubmit={handleSavePassword} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-navy-800/20"
                        required
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-navy-800/20"
                        required
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-navy-800/20"
                        required
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="gold" size="sm">
                      <Key className="w-4 h-4 mr-1" /> Change Password
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
