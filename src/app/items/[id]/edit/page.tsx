"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  X, 
  Loader2,
  ImageIcon,
  Package,
  ArrowLeft,
  Save
} from "lucide-react";
import Link from "next/link";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description too long"),
  category: z.enum([
    "TOPS", "BOTTOMS", "DRESSES", "OUTERWEAR", "SHOES", 
    "ACCESSORIES", "BAGS", "JEWELRY", "ACTIVEWEAR", 
    "FORMAL", "CASUAL", "VINTAGE", "DESIGNER"
  ]),
  subcategory: z.string().optional(),
  brand: z.string().optional(),
  size: z.string().min(1, "Size is required"),
  condition: z.enum(["EXCELLENT", "VERY_GOOD", "GOOD", "FAIR", "POOR"]),
  color: z.string().optional(),
  material: z.string().optional(),
  pointValue: z.number().min(10).max(500),
});

type ItemFormData = z.infer<typeof itemSchema>;

const categories = [
  { value: "TOPS", label: "Tops" },
  { value: "BOTTOMS", label: "Bottoms" },
  { value: "DRESSES", label: "Dresses" },
  { value: "OUTERWEAR", label: "Outerwear" },
  { value: "SHOES", label: "Shoes" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "BAGS", label: "Bags" },
  { value: "JEWELRY", label: "Jewelry" },
  { value: "ACTIVEWEAR", label: "Activewear" },
  { value: "FORMAL", label: "Formal" },
  { value: "CASUAL", label: "Casual" },
  { value: "VINTAGE", label: "Vintage" },
  { value: "DESIGNER", label: "Designer" },
];

const conditions = [
  { value: "EXCELLENT", label: "Excellent - Like new" },
  { value: "VERY_GOOD", label: "Very Good - Minor signs of wear" },
  { value: "GOOD", label: "Good - Some signs of wear" },
  { value: "FAIR", label: "Fair - Noticeable wear" },
  { value: "POOR", label: "Poor - Significant wear" },
];

export default function EditItemPage() {
  const params = useParams();
  const { user, isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  // Fetch the item to edit
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (params.id && isAuthenticated && token) {
      fetchItem();
    }
  }, [params.id, isAuthenticated, loading, token]);

  const fetchItem = async () => {
    try {
      setIsLoadingItem(true);
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/items/${params.id}`, {
        headers
      });
      
      if (response.ok) {
        const { item: fetchedItem } = await response.json();
        
        // Check if user is the owner
        if (fetchedItem.user.id !== user?.id) {
          setError("You don't have permission to edit this item");
          return;
        }
        
        setItem(fetchedItem);
        setUploadedImages(fetchedItem.images || []);
        
        // Populate the form with existing data
        reset({
          title: fetchedItem.title,
          description: fetchedItem.description,
          category: fetchedItem.category,
          subcategory: fetchedItem.subcategory || "",
          brand: fetchedItem.brand || "",
          size: fetchedItem.size,
          condition: fetchedItem.condition,
          color: fetchedItem.color || "",
          material: fetchedItem.material || "",
          pointValue: fetchedItem.points,
        });
        
      } else {
        setError("Item not found or you don't have permission to edit it");
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      setError("Failed to load item");
    } finally {
      setIsLoadingItem(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setUploadingImages(true);
    setError("");
    const newImages: string[] = [];

    try {
      for (let i = 0; i < Math.min(files.length, 5 - uploadedImages.length); i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed');
          continue;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size must be less than 5MB');
          continue;
        }

        // Upload to server
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'items');

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json();
          newImages.push(url);
        } else {
          console.error('Failed to upload image:', file.name);
          setError(`Failed to upload ${file.name}`);
        }
      }

      setUploadedImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Failed to upload images:', error);
      setError('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ItemFormData) => {
    if (!user?.id || !item) {
      setError('Unable to update item');
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/items/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          images: uploadedImages,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Item updated successfully!");
        setTimeout(() => {
          router.push("/items");
        }, 2000);
      } else {
        setError(result.error || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      setError("An error occurred while updating the item");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoadingItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (error && !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Item Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/items">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Items
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/items" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to My Items
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Item</h1>
          <p className="text-gray-600 mt-2">Update your item details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Edit Item Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="e.g., Vintage Denim Jacket"
                      className="mt-1"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe your item in detail..."
                      rows={4}
                      className="mt-1"
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select onValueChange={(value) => setValue("category", value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      {...register("subcategory")}
                      placeholder="e.g., T-shirt, Jeans"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      {...register("brand")}
                      placeholder="e.g., Nike, Zara"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="size">Size *</Label>
                    <Input
                      id="size"
                      {...register("size")}
                      placeholder="e.g., M, 32, 8"
                      className="mt-1"
                    />
                    {errors.size && (
                      <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="condition">Condition *</Label>
                    <Select onValueChange={(value) => setValue("condition", value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {conditions.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.condition && (
                      <p className="mt-1 text-sm text-red-600">{errors.condition.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      {...register("color")}
                      placeholder="e.g., Blue, Red"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      {...register("material")}
                      placeholder="e.g., Cotton, Polyester"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pointValue">Point Value *</Label>
                    <Input
                      id="pointValue"
                      type="number"
                      {...register("pointValue", { valueAsNumber: true })}
                      min="10"
                      max="500"
                      className="mt-1"
                    />
                    {errors.pointValue && (
                      <p className="mt-1 text-sm text-red-600">{errors.pointValue.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Images Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Images</h3>
                
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Item image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadedImages.length >= 5 || uploadingImages}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">
                      {uploadingImages ? "Uploading..." : "Click to upload images"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 5MB each. Max 5 images. ({uploadedImages.length}/5)
                    </p>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link href="/items">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Item
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
