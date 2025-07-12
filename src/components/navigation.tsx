"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Package, 
  Plus, 
  Search, 
  User, 
  Users,
  Menu, 
  X,
  Star,
  RefreshCw,
  Home,
  Settings,
  LogOut,
  MessageCircle
} from "lucide-react";

interface NavigationProps {
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    points: number;
    role?: 'USER' | 'ADMIN' | 'MODERATOR';
  };
}

export function Navigation({ isAuthenticated = false, user }: NavigationProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/(auth)') || pathname === '/login' || pathname === '/register') {
    return null;
  }

  // If user is authenticated and on landing page, redirect to appropriate dashboard
  if (isClient && isAuthenticated && pathname === '/') {
    if (user?.role === 'ADMIN' || user?.role === 'MODERATOR') {
      window.location.href = '/admin/dashboard';
    } else {
      window.location.href = '/dashboard';
    }
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  // Different navigation for authenticated vs non-authenticated users
  const navigation = isAuthenticated ? (
    user?.role === 'ADMIN' || user?.role === 'MODERATOR' ? [
      { name: 'Admin Dashboard', href: '/admin/dashboard', icon: Home },
      { name: 'Manage Users', href: '/admin/users', icon: Users },
      { name: 'Review Items', href: '/admin/items', icon: Package },
      { name: 'Monitor Swaps', href: '/admin/swaps', icon: RefreshCw },
    ] : [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Browse', href: '/browse', icon: Search },
      { name: 'My Items', href: '/items', icon: Package },
      { name: 'Messages', href: '/messages', icon: MessageCircle },
      { name: 'Swaps', href: '/swaps', icon: RefreshCw },
    ]
  ) : [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse', href: '/browse', icon: Search },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <RefreshCw className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">ReWear</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'border-green-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* Add Item Button */}
                <Button asChild size="sm">
                  <Link href="/items/new">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Link>
                </Button>

                {/* Points Display */}
                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-yellow-800">{user.points}</span>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={handleLogout}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {isAuthenticated && user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="ml-auto flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-yellow-800">{user.points}</span>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/items/new"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-3" />
                    Add New Item
                  </div>
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </div>
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </div>
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <div className="flex items-center">
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="space-y-1">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
