"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  Calendar,
  Star
} from "lucide-react";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pointValue: number;
  images: string[];
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function ReviewItemsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // All hooks must be called before any early returns
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'MODERATOR')) {
      fetchItems();
    }
  }, [statusFilter, isAuthenticated, user]);

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

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`/api/admin/review-items?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const { items } = await response.json();
        setItems(items);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setIsLoading(false);
    }
  };

  const handleItemAction = async (itemId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('authToken');
      
      await fetch('/api/admin/items', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, action }),
      });
      
      // Remove item from current list
      setItems(items.filter(item => item.id !== itemId));
      setSelectedItem(null);
    } catch (error) {
      console.error(`Failed to ${action} item:`, error);
    }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionStars = (condition: string) => {
    const stars = {
      'EXCELLENT': 5,
      'VERY_GOOD': 4,
      'GOOD': 3,
      'FAIR': 2,
      'POOR': 1
    }[condition] || 3;
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3 w-3 ${i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Review Items</h1>
          <p className="text-gray-600 mt-2">Review and approve user-submitted items</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search items by title, description, or user..."
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
                  <option value="PENDING">Pending Review</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Items ({filteredItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No items found</p>
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedItem?.id === item.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              {item.images[0] ? (
                                <img 
                                  src={item.images[0]} 
                                  alt={item.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-medium">{item.title}</h3>
                                <Badge className={getStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{item.category} • {item.pointValue} points</p>
                              <div className="flex items-center space-x-2 mb-2">
                                {getConditionStars(item.condition)}
                                <span className="text-xs text-gray-500">{item.condition}</span>
                              </div>
                              <p className="text-xs text-gray-500 flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {item.user.name} • 
                                <Calendar className="h-3 w-3 ml-2 mr-1" />
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {statusFilter === 'PENDING' && (
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemAction(item.id, 'approve');
                                }}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemAction(item.id, 'reject');
                                }}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Item Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedItem ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg">{selectedItem.title}</h3>
                      <Badge className={getStatusColor(selectedItem.status)}>
                        {selectedItem.status}
                      </Badge>
                    </div>
                    
                    {selectedItem.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedItem.images.slice(0, 4).map((image, index) => (
                          <img 
                            key={index}
                            src={image} 
                            alt={`${selectedItem.title} ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    )}
                    
                    <div>
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{selectedItem.description}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Category:</span>
                        <p className="text-gray-600">{selectedItem.category}</p>
                      </div>
                      <div>
                        <span className="font-medium">Condition:</span>
                        <div className="flex items-center space-x-1">
                          {getConditionStars(selectedItem.condition)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Points:</span>
                        <p className="text-gray-600">{selectedItem.pointValue}</p>
                      </div>
                      <div>
                        <span className="font-medium">Listed by:</span>
                        <p className="text-gray-600">{selectedItem.user.name}</p>
                      </div>
                    </div>
                    
                    {statusFilter === 'PENDING' && (
                      <div className="flex space-x-2 pt-4">
                        <Button 
                          className="flex-1"
                          onClick={() => handleItemAction(selectedItem.id, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleItemAction(selectedItem.id, 'reject')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Select an item to view details</p>
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
