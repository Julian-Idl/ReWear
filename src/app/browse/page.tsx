"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Heart, 
  Star, 
  Package,
  RefreshCw,
  Grid,
  List,
  SlidersHorizontal
} from "lucide-react";
import Link from "next/link";

interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: string;
  size: string;
  points: number;
  imageUrl?: string;
  user: {
    name: string;
    rating: number;
  };
  createdAt: string;
  isLiked?: boolean;
}

const CATEGORIES = [
  "All",
  "Tops",
  "Bottoms", 
  "Dresses",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Activewear"
];

const CONDITIONS = ["All", "New", "Excellent", "Good", "Fair"];
const SIZES = ["All", "XS", "S", "M", "L", "XL", "XXL"];

export default function BrowsePage() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [newArrivals, setNewArrivals] = useState<Item[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Item[]>([]);
  const [popularItems, setPopularItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [selectedSize, setSelectedSize] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeSection, setActiveSection] = useState<"all" | "new" | "recent" | "popular">("all");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/browse');
      
      if (response.ok) {
        const { items: fetchedItems } = await response.json();
        setAllItems(fetchedItems);
        
        // Categorize items based on creation date and other criteria
        const now = new Date();
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // New Arrivals: Items added in the last 3 days
        const newItems = fetchedItems.filter((item: Item) => 
          new Date(item.createdAt) >= threeDaysAgo
        );
        
        // Recently Added: Items added in the last week
        const recentItems = fetchedItems.filter((item: Item) => 
          new Date(item.createdAt) >= oneWeekAgo
        );
        
        // Popular Items: Items with high points (simulating popularity)
        const popularItems = fetchedItems
          .filter((item: Item) => item.points >= 30)
          .sort((a: Item, b: Item) => b.points - a.points);
        
        setNewArrivals(newItems.slice(0, 12)); // Show up to 12 new arrivals
        setRecentlyAdded(recentItems.slice(0, 12)); // Show up to 12 recent items
        setPopularItems(popularItems.slice(0, 12)); // Show up to 12 popular items
        setFilteredItems(fetchedItems);
      } else {
        console.error('Failed to fetch items');
        setAllItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setAllItems([]);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let currentItems = allItems;
    
    // Switch between different sections
    switch (activeSection) {
      case "new":
        currentItems = newArrivals;
        break;
      case "recent":
        currentItems = recentlyAdded;
        break;
      case "popular":
        currentItems = popularItems;
        break;
      default:
        currentItems = allItems;
    }

    let filtered = currentItems;

    if (searchQuery) {
      filtered = filtered.filter((item: Item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((item: Item) => item.category === selectedCategory);
    }

    if (selectedCondition !== "All") {
      filtered = filtered.filter((item: Item) => item.condition === selectedCondition);
    }

    if (selectedSize !== "All") {
      filtered = filtered.filter((item: Item) => item.size === selectedSize);
    }

    setFilteredItems(filtered);
  }, [allItems, newArrivals, recentlyAdded, popularItems, activeSection, searchQuery, selectedCategory, selectedCondition, selectedSize]);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "New": return "bg-green-100 text-green-800";
      case "Excellent": return "bg-blue-100 text-blue-800";
      case "Good": return "bg-yellow-100 text-yellow-800";
      case "Fair": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleLike = (itemId: string) => {
    setAllItems(prev => prev.map((item: Item) => 
      item.id === itemId ? { ...item, isLiked: !item.isLiked } : item
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
            <p className="text-gray-600 mt-2">Discover amazing clothing items from our community</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchItems}
            className="flex items-center gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Section Navigation */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={activeSection === "all" ? "default" : "outline"}
              onClick={() => setActiveSection("all")}
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              All Items ({allItems.length})
            </Button>
            <Button
              variant={activeSection === "new" ? "default" : "outline"}
              onClick={() => setActiveSection("new")}
              className="flex items-center gap-2"
            >
              <Star className="h-4 w-4" />
              New Arrivals ({newArrivals.length})
            </Button>
            <Button
              variant={activeSection === "recent" ? "default" : "outline"}
              onClick={() => setActiveSection("recent")}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recently Added ({recentlyAdded.length})
            </Button>
            <Button
              variant={activeSection === "popular" ? "default" : "outline"}
              onClick={() => setActiveSection("popular")}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Popular ({popularItems.length})
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className={`${showFilters || window.innerWidth >= 1024 ? 'block' : 'hidden'} mt-6 grid grid-cols-1 md:grid-cols-3 gap-4`}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {CONDITIONS.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {SIZES.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} found
              {activeSection !== "all" && (
                <span className="ml-2 text-sm text-gray-500">
                  in {activeSection === "new" ? "New Arrivals" : 
                       activeSection === "recent" ? "Recently Added" : 
                       "Popular Items"}
                </span>
              )}
            </p>
            {(searchQuery || selectedCategory !== "All" || selectedCondition !== "All" || selectedSize !== "All") && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-sm text-blue-600"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedCondition("All");
                  setSelectedSize("All");
                }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>

        {/* Items Grid/List */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeSection === "new" ? "No new arrivals yet" :
               activeSection === "recent" ? "No recently added items" :
               activeSection === "popular" ? "No popular items yet" :
               "No items found"}
            </h3>
            <p className="text-gray-500 mb-6">
              {(searchQuery || selectedCategory !== "All" || selectedCondition !== "All" || selectedSize !== "All") 
                ? "Try adjusting your search or filters"
                : activeSection === "new" 
                  ? "Check back soon for new items from our community"
                  : activeSection === "recent"
                  ? "Items added in the last week will appear here"
                  : activeSection === "popular"
                  ? "Items with high point values will appear here"
                  : "Be the first to add items to our community!"
              }
            </p>
            <div className="flex gap-4 justify-center">
              {(searchQuery || selectedCategory !== "All" || selectedCondition !== "All" || selectedSize !== "All") && (
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedCondition("All");
                  setSelectedSize("All");
                }}>
                  Clear Filters
                </Button>
              )}
              <Button variant="outline" onClick={fetchItems}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                {viewMode === "grid" ? (
                  // Grid View
                  <>
                    <div className="relative">
                      <div className="aspect-square bg-gray-200 rounded-t-lg overflow-hidden">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                        onClick={() => handleLike(item.id)}
                      >
                        <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                        <div className="flex items-center ml-2">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium">{item.points}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{item.category}</Badge>
                        <Badge className={getConditionColor(item.condition)}>
                          {item.condition}
                        </Badge>
                        <Badge variant="outline">Size {item.size}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600">{item.user.name}</span>
                          <div className="flex items-center ml-1">
                            <Star className="h-3 w-3 text-yellow-400" />
                            <span className="text-xs text-gray-500">{item.user.rating}</span>
                          </div>
                        </div>
                        <Button size="sm" asChild>
                          <Link href={`/items/${item.id}`}>View</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  // List View
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-xl">{item.title}</h3>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 mr-1" />
                              <span className="font-medium">{item.points} pts</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(item.id)}
                            >
                              <Heart className={`h-4 w-4 ${item.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                            </Button>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">{item.category}</Badge>
                          <Badge className={getConditionColor(item.condition)}>
                            {item.condition}
                          </Badge>
                          <Badge variant="outline">Size {item.size}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                            <div>
                              <p className="font-medium">{item.user.name}</p>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                                <span className="text-sm text-gray-500">{item.user.rating} rating</span>
                              </div>
                            </div>
                          </div>
                          <Button asChild>
                            <Link href={`/items/${item.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
