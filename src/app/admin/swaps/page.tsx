"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  RefreshCw, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Users,
  Calendar,
  ArrowRightLeft
} from "lucide-react";

interface SwapRequest {
  id: string;
  type: 'DIRECT' | 'POINTS';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  message?: string;
  createdAt: string;
  sender: {
    name: string;
    email: string;
  };
  receiver: {
    name: string;
    email: string;
  };
  senderItem: {
    title: string;
    pointValue: number;
  };
  receiverItem?: {
    title: string;
    pointValue: number;
  };
}

export default function MonitorSwapsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [swaps, setSwaps] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedSwap, setSelectedSwap] = useState<SwapRequest | null>(null);

  // All hooks must be called before any early returns
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'MODERATOR')) {
      fetchSwaps();
    }
  }, [statusFilter, typeFilter, isAuthenticated, user]);

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

  const fetchSwaps = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const response = await fetch(`/api/admin/swaps?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const { swaps } = await response.json();
        setSwaps(swaps);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch swaps:', error);
      setIsLoading(false);
    }
  };

  const filteredSwaps = swaps.filter(swap => 
    swap.sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    swap.receiver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    swap.senderItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    swap.receiverItem?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'DIRECT' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading swaps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monitor Swaps</h1>
          <p className="text-gray-600 mt-2">Track and manage all swap requests on the platform</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by user name or item title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="DIRECT">Direct Swap</option>
                  <option value="POINTS">Points Redemption</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Swaps List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Swap Requests ({filteredSwaps.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredSwaps.length === 0 ? (
                    <div className="text-center py-8">
                      <RefreshCw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No swaps found</p>
                    </div>
                  ) : (
                    filteredSwaps.map((swap) => (
                      <div 
                        key={swap.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSwap?.id === swap.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedSwap(swap)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getStatusColor(swap.status)}>
                                {swap.status}
                              </Badge>
                              <Badge className={getTypeColor(swap.type)}>
                                {swap.type === 'DIRECT' ? 'Direct Swap' : 'Points'}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 mb-2">
                              <div className="text-sm">
                                <p className="font-medium">{swap.sender.name}</p>
                                <p className="text-gray-500">{swap.senderItem.title}</p>
                              </div>
                              <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                              <div className="text-sm">
                                <p className="font-medium">{swap.receiver.name}</p>
                                <p className="text-gray-500">
                                  {swap.receiverItem?.title || `${swap.senderItem.pointValue} points`}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(swap.createdAt).toLocaleDateString()} at {new Date(swap.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Swap Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Swap Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSwap ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedSwap.status)}>
                        {selectedSwap.status}
                      </Badge>
                      <Badge className={getTypeColor(selectedSwap.type)}>
                        {selectedSwap.type === 'DIRECT' ? 'Direct Swap' : 'Points Redemption'}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Participants</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Sender:</span>
                          <span className="font-medium">{selectedSwap.sender.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Receiver:</span>
                          <span className="font-medium">{selectedSwap.receiver.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Items</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Offered:</span>
                          <p className="font-medium">{selectedSwap.senderItem.title}</p>
                          <p className="text-gray-500">{selectedSwap.senderItem.pointValue} points value</p>
                        </div>
                        {selectedSwap.receiverItem ? (
                          <div>
                            <span className="text-gray-600">Requested:</span>
                            <p className="font-medium">{selectedSwap.receiverItem.title}</p>
                            <p className="text-gray-500">{selectedSwap.receiverItem.pointValue} points value</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-gray-600">Points Request:</span>
                            <p className="font-medium">{selectedSwap.senderItem.pointValue} points</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {selectedSwap.message && (
                      <div>
                        <h4 className="font-medium mb-2">Message</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {selectedSwap.message}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-2">Timeline</h4>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(selectedSwap.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select a swap to view details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
