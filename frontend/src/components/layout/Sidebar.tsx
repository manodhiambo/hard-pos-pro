import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  FiHome,
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiTruck,
  FiBarChart2,
  FiSettings,
  FiBox,
  FiDollarSign,
  FiFileText,
  FiX,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Point of Sale', href: '/pos', icon: FiShoppingCart },
    { name: 'Products', href: '/products', icon: FiPackage },
    { name: 'Inventory', href: '/inventory', icon: FiBox },
    { name: 'Sales', href: '/sales', icon: FiDollarSign },
    { name: 'Customers', href: '/customers', icon: FiUsers },
    { name: 'Suppliers', href: '/suppliers', icon: FiTruck },
    { name: 'Purchase Orders', href: '/purchase-orders', icon: FiFileText },
    { name: 'Reports', href: '/reports', icon: FiBarChart2 },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">HARD-POS</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role?.roleName || 'Staff'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  active
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>HARD-POS PRO v1.0</p>
            <p>Helvino Technologies Ltd</p>
          </div>
        </div>
      </aside>
    </>
  );
}
