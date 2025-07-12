"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import SwapRequestModal from "@/components/ui/swap-request-modal";
import MessageModal from "@/components/ui/message-modal";
import LoginModal from "@/components/ui/login-modal";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Heart, 
  Star, 
  Package,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Shield,
  Calendar,
  Ruler,
  Tag,
  User
} from "lucide-react";
import Link from "next/link";

interface ItemDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  size: string;
  brand?: string;
  color?: string;
  material?: string;
  points: number;
  images: string[];
  user: {
    id: string;
    name: string;
    rating: number;
    totalItems: number;
    joinedDate: string;
  };
  createdAt: string;
  isLiked: boolean;
  isOwner: boolean;
  tags?: string[];
  subcategory?: string;
  available: boolean;
  status: string;
}

export default function ItemDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, token, isAuthenticated } = useAuth();

  useEffect(() => {
    if (params.id) {
      fetchItemDetails();
    }
  }, [params.id]);

  const fetchItemDetails = async () => {
    try {
      setIsLoading(true);
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/items/${params.id}`, {
        headers
      });
      
      if (response.ok) {
        const { item: fetchedItem } = await response.json();
        setItem(fetchedItem);
      } else if (response.status === 404) {
        setItem(null);
      } else {
        console.error('Failed to fetch item details');
        setItem(null);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
      setItem(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "New": return "bg-green-100 text-green-800";
      case "Excellent": return "bg-blue-100 text-blue-800";
      case "Good": return "bg-yellow-100 text-yellow-800";
      case "Fair": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleLike = () => {
    if (item) {
      setItem({ ...item, isLiked: !item.isLiked });
    }
  };

  const handleSwapRequest = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowSwapModal(true);
  };

  const handleMessageOwner = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowMessageModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading item details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-6">The item you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link href="/browse">Browse Other Items</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/browse">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
              {item.images && item.images.length > 0 && item.images[selectedImageIndex] ? (
                <img
                  src={item.images[selectedImageIndex]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <Package className="h-24 w-24 text-gray-400" />
                  <span className="ml-2 text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {item.images && item.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-200 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={`${item.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <Package className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{item.title}</h1>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className="p-2"
                  >
                    <Heart className={`h-5 w-5 ${item.isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                  </Button>
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="font-semibold text-yellow-800">{item.points} points</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline">{item.category}</Badge>
                {item.subcategory && <Badge variant="outline">{item.subcategory}</Badge>}
                <Badge className={getConditionColor(item.condition)}>
                  {item.condition}
                </Badge>
                <Badge variant="outline">Size {item.size}</Badge>
                {item.brand && <Badge variant="outline">{item.brand}</Badge>}
              </div>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">{item.description}</p>
            </div>

            {/* Item Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Item Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Category</span>
                  </div>
                  <span className="font-medium">{item.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Condition</span>
                  </div>
                  <span className="font-medium">{item.condition}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Ruler className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Size</span>
                  </div>
                  <span className="font-medium">{item.size}</span>
                </div>
                {item.color && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Color</span>
                    </div>
                    <span className="font-medium">{item.color}</span>
                  </div>
                )}
                {item.material && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Material</span>
                    </div>
                    <span className="font-medium">{item.material}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">Listed</span>
                  </div>
                  <span className="font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.user.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 mr-1" />
                        <span>{item.user.rating} rating</span>
                      </div>
                      <div className="flex items-center">
                        <Package className="h-3 w-3 mr-1" />
                        <span>{item.user.totalItems} items</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Since {new Date(item.user.joinedDate).getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!item.isOwner ? (
                <>
                  <Button onClick={handleSwapRequest} className="w-full" size="lg">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Request Swap
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" onClick={handleMessageOwner}>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Message Owner
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href={`/items/${item.id}/edit`}>
                      Edit Item
                    </Link>
                  </Button>
                  <p className="text-sm text-gray-500 text-center">This is your item</p>
                </div>
              )}
            </div>

            {/* Safety Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Safe Trading</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    All swaps are protected. Meet in public places and inspect items before finalizing exchanges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Items</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200 rounded-t-lg flex items-center justify-center">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Similar Item {i}</h3>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Outerwear</Badge>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm">40</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {item && !item.isOwner && (
        <>
          <SwapRequestModal
            isOpen={showSwapModal}
            onClose={() => setShowSwapModal(false)}
            targetItem={{
              id: item.id,
              title: item.title,
              pointValue: item.points,
              ownerId: item.user.id,
              ownerName: item.user.name,
            }}
            userPoints={user?.points || 0}
          />
          <MessageModal
            isOpen={showMessageModal}
            onClose={() => setShowMessageModal(false)}
            recipient={{
              id: item.user.id,
              name: item.user.name,
            }}
            itemTitle={item.title}
          />
        </>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
