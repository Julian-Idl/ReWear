"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Star,
  RefreshCw,
  Filter,
  ArrowUpDown
} from "lucide-react";
import Link from "next/link";

interface UserItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  size: string;
  points: number;
  status: "active" | "pending" | "sold" | "inactive";
  views: number;
  likes: number;
  swapRequests: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_FILTERS = [
  { value: "all", label: "All Items" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending Review" },
  { value: "sold", label: "Sold/Swapped" },
  { value: "inactive", label: "Inactive" }
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "most-viewed", label: "Most Viewed" },
  { value: "most-liked", label: "Most Liked" },
  { value: "highest-points", label: "Highest Points" }
];

export default function ItemsPage() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const [items, setItems] = useState<UserItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // All hooks must be called before any early returns
  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserItems();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered = [...filtered].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        filtered = [...filtered].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "most-viewed":
        filtered = [...filtered].sort((a, b) => b.views - a.views);
        break;
      case "most-liked":
        filtered = [...filtered].sort((a, b) => b.likes - a.likes);
        break;
      case "highest-points":
        filtered = [...filtered].sort((a, b) => b.points - a.points);
        break;
    }

    setFilteredItems(filtered);
  }, [items, searchQuery, statusFilter, sortBy]);

  const fetchUserItems = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/items?userId=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const { items: fetchedItems } = await response.json();
        
        // Transform items to match UserItem interface
        const transformedItems = fetchedItems.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          condition: item.condition,
          size: item.size,
          points: item.pointValue,
          status: getItemStatus(item.status, item.available),
          views: 0, // TODO: Implement view tracking
          likes: 0, // TODO: Implement like tracking
          swapRequests: 0, // TODO: Count swap requests
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }));
        
        setItems(transformedItems);
      } else {
        console.error('Failed to fetch user items');
        setItems([]);
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemStatus = (prismaStatus: string, available: boolean) => {
    switch (prismaStatus) {
      case 'PENDING': return 'pending';
      case 'APPROVED': return available ? 'active' : 'inactive';
      case 'REJECTED': return 'inactive';
      case 'SOLD': return 'sold';
      default: return 'inactive';
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
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "sold": return "bg-blue-100 text-blue-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return "🟢";
      case "pending": return "🟡";
      case "sold": return "🔵";
      case "inactive": return "⚫";
      default: return "⚫";
    }
  };

  const handleDeleteItem = (itemId: string) => {
    // TODO: Implement delete functionality
    if (confirm("Are you sure you want to delete this item?")) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleToggleStatus = (itemId: string) => {
    // TODO: Implement status toggle
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, status: item.status === "active" ? "inactive" : "active" } 
        : item
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Items</h1>
              <p className="text-gray-600 mt-2">Manage your listed clothing items</p>
            </div>
            <Button asChild>
              <Link href="/items/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search your items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
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

              {/* Sort */}
              <div className="flex items-center space-x-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {items.length === 0 ? "No items yet" : "No items match your filters"}
              </h3>
              <p className="text-gray-500 mb-6">
                {items.length === 0 
                  ? "Start building your closet by adding your first item"
                  : "Try adjusting your search or filters"
                }
              </p>
              {items.length === 0 ? (
                <Button asChild>
                  <Link href="/items/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Item
                  </Link>
                </Button>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setSortBy("newest");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                {filteredItems.length} of {items.length} items
              </p>
            </div>

            {/* Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <Package className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)} {item.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg truncate flex-1">{item.title}</h3>
                      <div className="flex items-center ml-2">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{item.points}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant="outline">Size {item.size}</Badge>
                      <Badge variant="outline">{item.condition}</Badge>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span>{item.views} views</span>
                      <span>{item.likes} likes</span>
                      <span>{item.swapRequests} requests</span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link href={`/items/${item.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/items/${item.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleToggleStatus(item.id)}
                        title={item.status === "active" ? "Deactivate" : "Activate"}
                      >
                        {item.status === "active" ? "⏸️" : "▶️"}
                      </Button>

                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
