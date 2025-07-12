"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter
} from "lucide-react";
import { redirect } from "next/navigation";

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  pendingItems: number;
  activeSwaps: number;
  totalTransactions: number;
  flaggedItems: number;
}

interface PendingItem {
  id: string;
  title: string;
  category: string;
  condition: string;
  user: {
    name: string;
    email: string;
  };
  images: string[];
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalItems: 0,
    pendingItems: 0,
    activeSwaps: 0,
    totalTransactions: 0,
    flaggedItems: 0
  });
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // All hooks must be called before any early returns
  useEffect(() => {
    if (!loading && isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'MODERATOR')) {
      fetchAdminData();
    }
  }, [isAuthenticated, user, loading]);

  // Redirect effect - separate from other logic
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || (user && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR')) {
        setShouldRedirect(true);
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/dashboard';
          }
        }, 100);
      }
    }
  }, [loading, isAuthenticated, user]);

  // Show loading while auth is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if should redirect
  if (shouldRedirect || !isAuthenticated || (user && user?.role !== 'ADMIN' && user?.role !== 'MODERATOR')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch admin statistics
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (statsResponse.ok) {
        const { stats } = await statsResponse.json();
        setStats(stats);
      }

      // Fetch pending items
      const itemsResponse = await fetch('/api/admin/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (itemsResponse.ok) {
        const { pendingItems } = await itemsResponse.json();
        setPendingItems(pendingItems);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setIsLoading(false);
    }
  };

  const handleItemAction = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      // TODO: Implement real API call
      console.log(`${action} item ${itemId}`);
      
      // Remove from pending items
      setPendingItems(prev => prev.filter(item => item.id !== itemId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingItems: prev.pendingItems - 1,
        totalItems: action === 'approve' ? prev.totalItems + 1 : prev.totalItems
      }));
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users, items, and platform operations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Approved items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingItems}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Swaps</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSwaps}</div>
              <p className="text-xs text-muted-foreground">Ongoing exchanges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Total completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.flaggedItems}</div>
              <p className="text-xs text-muted-foreground">Need review</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Items for Approval */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Item Approvals</CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingItems.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
                    <p className="text-gray-500">No pending items</p>
                  </div>
                ) : (
                  pendingItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.category} • {item.condition}</p>
                          <p className="text-xs text-gray-400">by {item.user.name}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleItemAction(item.id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleItemAction(item.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Platform Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">New user registered: jane@example.com</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">Swap completed between Alice and Bob</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">Item reported: Vintage Jacket</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">Payment processed: $50 premium membership</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button 
                className="h-20 flex flex-col"
                onClick={() => window.location.href = '/admin/users'}
              >
                <Users className="h-8 w-8 mb-2" />
                Manage Users
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => window.location.href = '/admin/items'}
              >
                <Package className="h-8 w-8 mb-2" />
                Review Items
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => window.location.href = '/admin/swaps'}
              >
                <RefreshCw className="h-8 w-8 mb-2" />
                Monitor Swaps
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col"
                onClick={() => fetchAdminData()}
              >
                <TrendingUp className="h-8 w-8 mb-2" />
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
