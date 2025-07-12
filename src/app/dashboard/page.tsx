"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus, 
  Star, 
  TrendingUp, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Heart,
  MessageCircle
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalItems: number;
  activeSwaps: number;
  totalPoints: number;
  completedSwaps: number;
}

interface UserItem {
  id: string;
  title: string;
  category: string;
  condition: string;
  points: number;
  status: string;
  imageUrl?: string;
  createdAt: string;
}

interface SwapRequest {
  id: string;
  status: string;
  offeredItem: {
    title: string;
    imageUrl?: string;
  };
  requestedItem: {
    title: string;
    imageUrl?: string;
  };
  otherUser: {
    name: string;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const { user, isAuthenticated, token, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    activeSwaps: 0,
    totalPoints: 0,
    completedSwaps: 0
  });
  const [recentItems, setRecentItems] = useState<UserItem[]>([]);
  const [recentSwaps, setRecentSwaps] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redirect admin users to admin dashboard
      if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
        window.location.href = '/admin/dashboard';
        return;
      }
      
      fetchUserData();
    }
  }, [isAuthenticated, user, loading]);

  const fetchUserData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Fetch user stats
      const statsResponse = await fetch(`/api/users/stats?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (statsResponse.ok) {
        const { stats: userStats } = await statsResponse.json();
        setStats(userStats);
      }

      // Fetch user items
      const itemsResponse = await fetch(`/api/items?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (itemsResponse.ok) {
        const { items } = await itemsResponse.json();
        setRecentItems((items || []).slice(0, 5)); // Show only 5 recent items
      }

      // Fetch swap requests
      const swapsResponse = await fetch(`/api/swaps?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (swapsResponse.ok) {
        const { swaps } = await swapsResponse.json();
        setRecentSwaps((swaps || []).slice(0, 5)); // Show only 5 recent swaps
      }
      
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your items.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Items you've listed</p>
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
              <CardTitle className="text-sm font-medium">Points Balance</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground">Available points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Swaps</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedSwaps}</div>
              <p className="text-xs text-muted-foreground">Successful exchanges</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Recent Items</CardTitle>
              <Button asChild size="sm">
                <Link href="/items/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No items yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/items/new">List Your First Item</Link>
                    </Button>
                  </div>
                ) : (
                  recentItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-gray-500">{item.category} • {item.condition}</p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-400 mr-1" />
                            <span className="text-sm">{item.points} points</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {recentItems.length > 0 && (
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/items">View All Items</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Swap Requests */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Swap Requests</CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link href="/browse">
                  <Eye className="h-4 w-4 mr-2" />
                  Browse Items
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSwaps.length === 0 ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No swap requests yet</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/browse">Start Browsing</Link>
                    </Button>
                  </div>
                ) : (
                  recentSwaps.map((swap) => (
                    <div key={swap.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getStatusColor(swap.status)}>
                          {swap.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          with {swap.otherUser.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600">Your item</p>
                          <p className="text-sm font-medium">{swap.offeredItem.title}</p>
                        </div>
                        <div className="flex-1 text-center">
                          <RefreshCw className="h-6 w-6 text-gray-400 mx-auto" />
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-600">Their item</p>
                          <p className="text-sm font-medium">{swap.requestedItem.title}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm" className="flex-1">Accept</Button>
                        <Button size="sm" variant="outline" className="flex-1">Decline</Button>
                        <Button size="sm" variant="ghost">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {recentSwaps.length > 0 && (
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/swaps">View All Swaps</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button asChild className="h-20 flex flex-col">
                <Link href="/items/new">
                  <Plus className="h-8 w-8 mb-2" />
                  List New Item
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/browse">
                  <Eye className="h-8 w-8 mb-2" />
                  Browse Items
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20 flex flex-col">
                <Link href="/profile">
                  <Star className="h-8 w-8 mb-2" />
                  Update Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
