"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  User, 
  Star, 
  Package,
  Edit,
  Save,
  X,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Camera,
  RefreshCw,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  location?: string;
  avatar?: string;
  rating: number;
  totalItems: number;
  completedSwaps: number;
  totalPoints: number;
  joinedDate: string;
  preferences: {
    categories: string[];
    sizes: string[];
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
}

interface UserItem {
  id: string;
  title: string;
  category: string;
  condition: string;
  points: number;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    location: "",
    phone: ""
  });

  useEffect(() => {
    // TODO: Fetch real data from API
    // Simulated data for now
    setTimeout(() => {
      const mockProfile: UserProfile = {
        id: "user1",
        name: "Alice Johnson",
        email: "alice@example.com", 
        phone: "+1 (555) 123-4567",
        bio: "Fashion enthusiast who loves vintage pieces and sustainable clothing. Looking to share my closet with the community!",
        location: "San Francisco, CA",
        rating: 4.8,
        totalItems: 23,
        completedSwaps: 15,
        totalPoints: 250,
        joinedDate: "2023-06-15",
        preferences: {
          categories: ["Dresses", "Tops", "Outerwear"],
          sizes: ["S", "M"],
          emailNotifications: true,
          pushNotifications: false
        }
      };

      const mockItems: UserItem[] = [
        {
          id: "1",
          title: "Vintage Denim Jacket",
          category: "Outerwear",
          condition: "Excellent",
          points: 45,
          status: "active",
          createdAt: "2024-01-15"
        },
        {
          id: "2", 
          title: "Summer Floral Dress",
          category: "Dresses",
          condition: "Good",
          points: 35,
          status: "pending",
          createdAt: "2024-01-14"
        }
      ];
      
      setProfile(mockProfile);
      setUserItems(mockItems);
      setEditForm({
        name: mockProfile.name,
        bio: mockProfile.bio || "",
        location: mockProfile.location || "",
        phone: mockProfile.phone || ""
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleEditToggle = () => {
    if (isEditing && profile) {
      // Reset form to original values
      setEditForm({
        name: profile.name,
        bio: profile.bio || "",
        location: profile.location || "",
        phone: profile.phone || ""
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // TODO: Implement API call to update profile
      console.log("Updating profile:", editForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state
      if (profile) {
        setProfile({
          ...profile,
          name: editForm.name,
          bio: editForm.bio,
          location: editForm.location,
          phone: editForm.phone
        });
      }
      
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {saveSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader className="text-center">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl">
                      {profile.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 h-8 w-8 p-0 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <div className="space-y-3 mt-4">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="text-center font-semibold"
                    />
                  </div>
                ) : (
                  <div>
                    <CardTitle className="text-2xl">{profile.name}</CardTitle>
                    <div className="flex items-center justify-center mt-2">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="font-medium">{profile.rating}</span>
                      <span className="text-gray-500 ml-1">rating</span>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 text-gray-400 mr-3" />
                    <span>{profile.email}</span>
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 text-gray-400 mr-3" />
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="Phone number"
                        className="h-8"
                      />
                    </div>
                  ) : (
                    profile.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{profile.phone}</span>
                      </div>
                    )
                  )}
                  
                  {isEditing ? (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                      <Input
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="Location"
                        className="h-8"
                      />
                    </div>
                  ) : (
                    profile.location && (
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                        <span>{profile.location}</span>
                      </div>
                    )
                  )}
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                    <span>Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label className="text-sm font-medium">About</Label>
                  {isEditing ? (
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">
                      {profile.bio || "No bio added yet."}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex-1"
                      >
                        {isSaving ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleEditToggle}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleEditToggle} className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items Listed</span>
                  <span className="font-semibold">{profile.totalItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Swaps</span>
                  <span className="font-semibold">{profile.completedSwaps}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Points</span>
                  <span className="font-semibold">{profile.totalPoints}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold">
                    {profile.totalItems > 0 ? Math.round((profile.completedSwaps / profile.totalItems) * 100) : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Items ({userItems.length})</CardTitle>
                <Button asChild>
                  <Link href="/items/new">
                    <Package className="h-4 w-4 mr-2" />
                    Add Item
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {userItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No items listed yet</p>
                    <Button asChild>
                      <Link href="/items/new">List Your First Item</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
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
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/items/${item.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-4">
                      <Button variant="outline" asChild>
                        <Link href="/items">View All Items</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Preferred Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.preferences.categories.map((category) => (
                      <Badge key={category} variant="outline">{category}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Preferred Sizes</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.preferences.sizes.map((size) => (
                      <Badge key={size} variant="outline">Size {size}</Badge>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
