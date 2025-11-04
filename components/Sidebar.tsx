/**
 * Sidebar Navigation Component
 * Modern sidebar navigation similar to the reference image
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  userName: string;
  userRole: 'client' | 'provider';
}

export default function Sidebar({ userName, userRole }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const menuItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
    },
    ...(userRole === 'client'
      ? [
          {
            name: 'My Requests',
            href: '/dashboard#requests',
            icon: '📋',
          },
          {
            name: 'Offers',
            href: '/dashboard#offers',
            icon: '💼',
          },
        ]
      : [
          {
            name: 'Open Requests',
            href: '/dashboard#requests',
            icon: '🔍',
          },
          {
            name: 'My Offers',
            href: '/dashboard#offers',
            icon: '📤',
          },
        ]),
  ];

  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">B2BCompare</h1>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium text-sm truncate">{userName}</p>
            <p className="text-gray-400 text-xs capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

