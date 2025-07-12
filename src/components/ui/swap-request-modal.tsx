"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Package, Coins } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Simple toast replacement
const useToast = () => ({
  toast: ({ title, description, variant }: { title?: string; description?: string; variant?: string }) => {
    const message = title && description ? `${title}: ${description}` : title || description || '';
    if (variant === 'destructive') {
      alert(`Error: ${message}`);
    } else {
      alert(message);
    }
  }
});

interface UserItem {
  id: string;
  title: string;
  pointValue: number;
  images: string[];
  condition: string;
  category: string;
}

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: {
    id: string;
    title: string;
    pointValue: number;
    ownerId: string;
    ownerName: string;
  };
  userPoints: number;
}

export default function SwapRequestModal({
  isOpen,
  onClose,
  targetItem,
  userPoints
}: SwapRequestModalProps) {
  const [swapType, setSwapType] = useState<"DIRECT" | "POINTS">("DIRECT");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [message, setMessage] = useState("");
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { token, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchUserItems();
    }
  }, [isOpen]);

  const fetchUserItems = async () => {
    try {
      setIsLoading(true);
      
      if (!token || !isAuthenticated || !user?.id) {
        toast({
          title: "Error",
          description: "You must be logged in to make swap requests",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/items?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const { items } = await response.json();
        // Filter only available items that can be swapped
        const availableItems = items.filter((item: any) => 
          item.status === 'APPROVED' && item.available
        );
        setUserItems(availableItems);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch user items:', errorData);
        toast({
          title: "Error",
          description: errorData.error || "Failed to fetch your items",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (!token || !isAuthenticated) {
        toast({
          title: "Error",
          description: "You must be logged in to make swap requests",
          variant: "destructive",
        });
        return;
      }

      // Validation
      if (swapType === "DIRECT" && !selectedItem) {
        toast({
          title: "Error",
          description: "Please select an item to swap",
          variant: "destructive",
        });
        return;
      }

      if (swapType === "POINTS" && (user?.points || 0) < targetItem.pointValue) {
        toast({
          title: "Error",
          description: "You don't have enough points for this item",
          variant: "destructive",
        });
        return;
      }

      const swapData = {
        receiverItemId: targetItem.id,
        type: swapType,
        message: message.trim() || undefined,
        ...(swapType === "DIRECT" && { senderItemId: selectedItem })
      };

      const response = await fetch('/api/swap-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(swapData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Swap request sent successfully!",
        });
        onClose();
        setMessage("");
        setSelectedItem("");
        setSwapType("DIRECT");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send swap request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating swap request:', error);
      toast({
        title: "Error",
        description: "Failed to send swap request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "excellent": return "bg-green-100 text-green-800";
      case "very_good": return "bg-blue-100 text-blue-800";
      case "good": return "bg-yellow-100 text-yellow-800";
      case "fair": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Swap for "{targetItem.title}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Swap Type Selection */}
          <div>
            <Label className="text-base font-medium">Choose swap type:</Label>
            <RadioGroup 
              value={swapType} 
              onValueChange={(value: string) => setSwapType(value as "DIRECT" | "POINTS")}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DIRECT" id="direct" />
                <Label htmlFor="direct" className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Item for Item Swap
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="POINTS" id="points" />
                <Label htmlFor="points" className="flex items-center">
                  <Coins className="h-4 w-4 mr-2" />
                  Redeem with Points ({targetItem.pointValue} points required)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Direct Swap - Item Selection */}
          {swapType === "DIRECT" && (
            <div>
              <Label className="text-base font-medium">Select your item to offer:</Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading your items...</span>
                </div>
              ) : userItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>You don't have any available items to swap.</p>
                  <p className="text-sm">List some items first to start swapping!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 max-h-60 overflow-y-auto">
                  {userItems.map((item) => (
                    <Card 
                      key={item.id}
                      className={`cursor-pointer transition-all ${
                        selectedItem === item.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex space-x-3">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                            {item.images?.[0] ? (
                              <img 
                                src={item.images[0]} 
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className={getConditionColor(item.condition)}
                              >
                                {item.condition.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-gray-500">{item.pointValue} pts</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Points Swap */}
          {swapType === "POINTS" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-900">Points Redemption</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You'll spend {targetItem.pointValue} points to get this item
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Your Points: {user?.points || 0}</p>
                  <p className="text-sm text-blue-600">
                    After: {(user?.points || 0) - targetItem.pointValue}
                  </p>
                </div>
              </div>
              {(user?.points || 0) < targetItem.pointValue && (
                <p className="text-sm text-red-600 mt-2">
                  ⚠️ You need {targetItem.pointValue - (user?.points || 0)} more points
                </p>
              )}
            </div>
          )}

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-base font-medium">
              Message to {targetItem.ownerName} (optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Say something nice about why you want this item..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={
                isSubmitting || 
                (swapType === "DIRECT" && !selectedItem) ||
                (swapType === "POINTS" && (user?.points || 0) < targetItem.pointValue)
              }
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Swap Request"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
