import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FiMenu, FiUser, FiLogOut, FiSettings, FiBell, FiSearch } from 'react-icons/fi';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types';
import { getInitials } from '@/utils/format';
import toast from 'react-hot-toast';

interface NavbarProps {
  onMenuClick: () => void;
  user: User;
}

export default function Navbar({ onMenuClick, user }: NavbarProps) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Low Stock Alert', message: 'Cement 50kg is below reorder level', time: '5 min ago', unread: true },
    { id: 2, title: 'New Sale', message: 'Sale #SAL-12345 completed', time: '15 min ago', unread: true },
    { id: 3, title: 'Purchase Order', message: 'PO #PO-67890 received', time: '1 hour ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left side */}
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <FiMenu className="w-6 h-6" />
        </button>

        {/* Search (hidden on mobile) */}
        <div className="hidden md:block ml-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products, customers..."
              className="w-64 lg:w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-4">
        {/* Branch info */}
        <div className="hidden lg:block text-right">
          <div className="text-sm font-medium text-gray-900">{user.branch?.branchName || 'Main Branch'}</div>
          <div className="text-xs text-gray-500">{user.role?.roleName || 'User'}</div>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FiBell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      notification.unread ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-gray-900">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      {notification.unread && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1"></span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">{notification.time}</div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 focus:outline-none"
          >
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials(user.fullName)}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
              <div className="text-xs text-gray-500">{user.username}</div>
            </div>
          </button>

          {/* User dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-4 border-b">
                <div className="font-medium text-gray-900">{user.fullName}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
              <div className="py-2">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/profile');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiUser className="w-4 h-4 mr-3" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push('/settings');
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <FiSettings className="w-4 h-4 mr-3" />
                  Settings
                </button>
              </div>
              <div className="border-t py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FiLogOut className="w-4 h-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
