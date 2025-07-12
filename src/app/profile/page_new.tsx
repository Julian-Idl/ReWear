"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  CheckCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface UserItem {
  id: string;
  title: string;
  category: string;
  condition: string;
  pointValue: number;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    phone: ""
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchUserItems();
      setEditForm({
        name: user.name || "",
        bio: user.bio || "",
        phone: user.phone || ""
      });
      setIsLoading(false);
    } else if (!authLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchUserItems = async () => {
    if (!user || !token) return;
    
    try {
      const response = await fetch(`/api/items?userId=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserItems(data.items || []);
      } else {
        console.error('Failed to fetch user items');
      }
    } catch (error) {
      console.error('Error fetching user items:', error);
    }
  };

  const handleEditToggle = () => {
    if (isEditing && user) {
      // Reset form to original values
      setEditForm({
        name: user.name,
        bio: user.bio || "",
        phone: user.phone || ""
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
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SWAPPED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
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
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader className="text-center">
                <div className="relative inline-block">
                  <Avatar className="h-24 w-24 mx-auto">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">
                      {user.name.charAt(0)}
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
                <div className="mt-4">
                  {!isEditing ? (
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                  ) : (
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="text-center text-xl font-semibold"
                    />
                  )}
                  {user.verified && (
                    <div className="flex items-center justify-center mt-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-600">Verified</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      {!isEditing ? (
                        <span>{user.phone}</span>
                      ) : (
                        <Input
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="Phone number"
                        />
                      )}
                    </div>
                  )}
                  
                  {user.createdAt && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium text-gray-700">Bio</Label>
                  {!isEditing ? (
                    <p className="mt-2 text-sm text-gray-600">
                      {user.bio || "No bio added yet."}
                    </p>
                  ) : (
                    <Textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="mt-2"
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  )}
                </div>

                {/* Edit/Save Buttons */}
                <div className="pt-4 border-t">
                  {!isEditing ? (
                    <Button onClick={handleEditToggle} className="w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="flex-1"
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleEditToggle}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Items</span>
                  <span className="font-semibold">{userItems.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">ReWear Points</span>
                  <span className="font-semibold">{user.points}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Items</span>
                  <span className="font-semibold">
                    {userItems.filter(item => item.status === 'AVAILABLE').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  My Items ({userItems.length})
                </CardTitle>
                <Link href="/items/new">
                  <Button>Add New Item</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {userItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No items yet</p>
                    <Link href="/items/new">
                      <Button>Add Your First Item</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userItems.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-lg truncate">{item.title}</h4>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>Category: {item.category}</p>
                            <p>Condition: {item.condition}</p>
                            <p>Points: {item.pointValue}</p>
                            <p>Posted: {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Link href={`/items/${item.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                View
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm" className="flex-1">
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
