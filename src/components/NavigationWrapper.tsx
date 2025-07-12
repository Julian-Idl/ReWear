"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Navigation } from "@/components/navigation";

export function NavigationWrapper() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="ml-2 h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <Navigation 
      isAuthenticated={isAuthenticated} 
      user={user || undefined} 
    />
  );
}
