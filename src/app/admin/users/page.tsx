"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Filter,
  MoreHorizontal,
  Shield,
  ShieldCheck,
  Ban,
  UserCheck,
  Mail,
  Calendar
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  points: number;
  verified: boolean;
  active: boolean;
  createdAt: string;
  _count: {
    items: number;
    sentRequests: number;
  };
}

export default function ManageUsersPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // All hooks must be called before any early returns
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'MODERATOR')) {
      fetchUsers();
    }
  }, [isAuthenticated, user]);

  // Redirect effect
  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR'))) {
      if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    }
  }, [loading, isAuthenticated, user]);

  // Show loading while auth is loading
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Don't render if not authenticated or not admin
  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR')) {
    return null;
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const { users } = await response.json();
        setUsers(users);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setIsLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, action }),
      });
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-600 mt-2">View and manage platform users</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="USER">Users</option>
                  <option value="ADMIN">Admins</option>
                  <option value="MODERATOR">Moderators</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Users ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{u.name}</h3>
                          {u.role === 'ADMIN' && (
                            <Badge className="bg-red-100 text-red-800">
                              <ShieldCheck className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          {u.role === 'MODERATOR' && (
                            <Badge className="bg-orange-100 text-orange-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Moderator
                            </Badge>
                          )}
                          {u.verified && (
                            <Badge className="bg-green-100 text-green-800">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {!u.active && (
                            <Badge className="bg-gray-100 text-gray-800">
                              <Ban className="h-3 w-3 mr-1" />
                              Suspended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {u.email}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400 mt-1">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Joined {new Date(u.createdAt).toLocaleDateString()}
                          </span>
                          <span>{u.points} points</span>
                          <span>{u._count.items} items</span>
                          <span>{u._count.sentRequests} swaps</span>
                        </div>
                      </div>
                    </div>
                    
                    {user?.role === 'ADMIN' && u.id !== user.id && (
                      <div className="flex space-x-2">
                        {u.active ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction(u.id, 'suspend')}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction(u.id, 'activate')}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        {u.role === 'USER' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUserAction(u.id, 'promote')}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Make Moderator
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
