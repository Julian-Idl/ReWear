"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  RefreshCw, 
  Package, 
  MessageCircle, 
  Check, 
  X, 
  Clock,
  ArrowRight,
  User,
  Calendar,
  Star
} from "lucide-react";

interface SwapRequest {
  id: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  type: "incoming" | "outgoing";
  createdAt: string;
  offeredItem: {
    id: string;
    title: string;
    imageUrl?: string;
    points: number;
  };
  requestedItem: {
    id: string;
    title: string;
    imageUrl?: string;
    points: number;
  };
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  message?: string;
  lastActivity: string;
}

const STATUS_FILTERS = [
  { value: "all", label: "All Requests" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" }
];

export default function SwapsPage() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | "incoming" | "outgoing">("all");

  // All hooks must be called before any early returns
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSwapRequests();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let filtered = swapRequests;

    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(request => request.type === activeTab);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    // Sort by most recent activity
    filtered = [...filtered].sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    setFilteredRequests(filtered);
  }, [swapRequests, activeTab, statusFilter]);

  const fetchSwapRequests = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/swaps?userId=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const { swaps } = await response.json();
        setSwapRequests(swaps);
      } else {
        console.error('Failed to fetch swap requests');
        setSwapRequests([]);
      }
    } catch (error) {
      console.error('Error fetching swap requests:', error);
      setSwapRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is loading
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "accepted": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "accepted": return <Check className="h-4 w-4" />;
      case "completed": return <RefreshCw className="h-4 w-4" />;
      case "rejected": return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    setSwapRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: "accepted" as const, lastActivity: new Date().toISOString() }
          : request
      )
    );
  };

  const handleRejectRequest = (requestId: string) => {
    setSwapRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: "rejected" as const, lastActivity: new Date().toISOString() }
          : request
      )
    );
  };

  const handleCompleteSwap = (requestId: string) => {
    setSwapRequests(prev => 
      prev.map(request => 
        request.id === requestId 
          ? { ...request, status: "completed" as const, lastActivity: new Date().toISOString() }
          : request
      )
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading swap requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
          <p className="text-gray-600 mt-2">Manage your incoming and outgoing swap requests</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: "all", label: "All Requests" },
                { key: "incoming", label: "Incoming" },
                { key: "outgoing", label: "Outgoing" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {swapRequests.filter(r => tab.key === "all" || r.type === tab.key).length}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {STATUS_FILTERS.map(filter => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <RefreshCw className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No swap requests</h3>
              <p className="text-gray-500">
                {activeTab === "all" 
                  ? "You don't have any swap requests yet."
                  : `No ${activeTab} requests found.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(request.status)}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </Badge>
                      <Badge variant="outline">
                        {request.type === "incoming" ? "Incoming" : "Outgoing"}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.otherUser.avatar} />
                      <AvatarFallback>{request.otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{request.otherUser.name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span>{request.otherUser.rating} rating</span>
                      </div>
                    </div>
                  </div>

                  {/* Swap Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      {/* Offered Item */}
                      <div className="flex-1 text-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-sm mb-1">
                          {request.type === "incoming" ? "Their Item" : "Your Item"}
                        </h4>
                        <p className="text-sm text-gray-600">{request.offeredItem.title}</p>
                        <div className="flex items-center justify-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-xs">{request.offeredItem.points} pts</span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 mx-4">
                        <ArrowRight className="h-6 w-6 text-gray-400" />
                      </div>

                      {/* Requested Item */}
                      <div className="flex-1 text-center">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h4 className="font-medium text-sm mb-1">
                          {request.type === "incoming" ? "Your Item" : "Their Item"}
                        </h4>
                        <p className="text-sm text-gray-600">{request.requestedItem.title}</p>
                        <div className="flex items-center justify-center mt-1">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span className="text-xs">{request.requestedItem.points} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {request.message && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">{request.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    {request.status === "pending" && request.type === "incoming" && (
                      <>
                        <Button 
                          onClick={() => handleAcceptRequest(request.id)}
                          className="flex-1 sm:flex-none"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleRejectRequest(request.id)}
                          className="flex-1 sm:flex-none"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </>
                    )}
                    
                    {request.status === "accepted" && (
                      <Button 
                        onClick={() => handleCompleteSwap(request.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </Button>
                    )}

                    <Button variant="outline" className="flex-1 sm:flex-none">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>

                    <Button variant="outline" className="flex-1 sm:flex-none">
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </div>

                  {/* Last Activity */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Last activity: {new Date(request.lastActivity).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
