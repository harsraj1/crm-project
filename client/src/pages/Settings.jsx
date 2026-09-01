import { User, Shield, Bell, Palette, Loader2, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { clsx } from 'clsx';

export default function Settings() {
  const { user, updateProfile, updatePassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [preferences, setPreferences] = useState({ theme: 'system', notifications: true, emailUpdates: true });

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateProfile(profile.name, profile.email);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setError('New passwords do not match');
    }
    setLoading(true);
    setError('');
    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="card">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto px-4 -mb-px" aria-label="Settings tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                  )}
                  role="tab"
                  aria-selected={isActive}
                >
                  <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {(success || error) && (
            <div className={clsx('mb-6 p-4 rounded-lg', success ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300')}>
              {success || error}
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="label">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="label">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                    className="input mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />} Save Changes
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="label">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="label">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input mt-1"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="label">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input mt-1"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />} Update Password
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
              <div className="space-y-4">
                <NotificationToggle
                  label="Push Notifications"
                  description="Receive browser notifications for important updates"
                  checked={preferences.notifications}
                  onChange={checked => setPreferences({ ...preferences, notifications: checked })}
                />
                <NotificationToggle
                  label="Email Updates"
                  description="Receive weekly summary emails and important announcements"
                  checked={preferences.emailUpdates}
                  onChange={checked => setPreferences({ ...preferences, emailUpdates: checked })}
                />
                <NotificationToggle
                  label="Lead Assignments"
                  description="Notify me when a new lead is assigned to me"
                  checked={true}
                  onChange={() => {}}
                />
                <NotificationToggle
                  label="Deal Updates"
                  description="Notify me when deal status changes or activities are logged"
                  checked={true}
                  onChange={() => {}}
                />
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
              <div>
                <label className="label">Theme</label>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {['light', 'dark', 'system'].map(theme => (
                    <label key={theme} className={clsx(
                      'relative cursor-pointer',
                      preferences.theme === theme ? 'ring-2 ring-primary-500' : ''
                    )}>
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={preferences.theme === theme}
                        onChange={() => setPreferences({ ...preferences, theme })}
                        className="sr-only"
                      />
                      <div className={clsx(
                        'p-6 rounded-xl border-2 transition-colors text-center',
                        preferences.theme === theme
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}>
                        <div className="text-capitalize font-medium text-gray-900 dark:text-white">{theme}</div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {theme === 'system' ? 'Matches system' : `${theme.charAt(0).toUpperCase() + theme.slice(1)} mode`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
      </label>
    </div>
  );
}
