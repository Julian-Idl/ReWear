"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Package
} from "lucide-react";

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

export default function NewItemPage() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      pointValue: 50,
    },
  });

  // Use useEffect for redirect to avoid render phase issues
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading or return null while checking auth
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
    if (!user?.id) {
      setError('User not found');
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          images: uploadedImages,
          tags: [], // TODO: Add tags input
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Item created successfully! It will be reviewed by our team.");
        setTimeout(() => {
          router.push("/items");
        }, 2000);
      } else {
        setError(result.error || "Failed to create item");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">List New Item</h1>
          <p className="text-gray-600 mt-2">Add your clothing item to start swapping or earning points</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Item Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Item Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register("title")}
                    placeholder="e.g., Vintage Denim Jacket"
                    className="mt-1"
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe your item in detail..."
                    rows={4}
                    className="mt-1"
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <Label>Category *</Label>
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
                    <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    {...register("brand")}
                    placeholder="e.g., Zara, H&M, Vintage"
                    className="mt-1"
                  />
                </div>

                {/* Size */}
                <div>
                  <Label htmlFor="size">Size *</Label>
                  <Input
                    id="size"
                    {...register("size")}
                    placeholder="e.g., S, M, L, XL, 32, 34"
                    className="mt-1"
                  />
                  {errors.size && (
                    <p className="text-sm text-red-600 mt-1">{errors.size.message}</p>
                  )}
                </div>

                {/* Condition */}
                <div>
                  <Label>Condition *</Label>
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
                    <p className="text-sm text-red-600 mt-1">{errors.condition.message}</p>
                  )}
                </div>

                {/* Color */}
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    {...register("color")}
                    placeholder="e.g., Blue, Red, Multi-color"
                    className="mt-1"
                  />
                </div>

                {/* Material */}
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    {...register("material")}
                    placeholder="e.g., Cotton, Polyester, Wool"
                    className="mt-1"
                  />
                </div>

                {/* Point Value */}
                <div>
                  <Label htmlFor="pointValue">Point Value</Label>
                  <Input
                    id="pointValue"
                    type="number"
                    {...register("pointValue", { valueAsNumber: true })}
                    min="10"
                    max="500"
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    How many points this item is worth (10-500)
                  </p>
                  {errors.pointValue && (
                    <p className="text-sm text-red-600 mt-1">{errors.pointValue.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Photos ({uploadedImages.length}/5)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Upload Area */}
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
                      PNG, JPG up to 5MB each. Max 5 images.
                    </p>
                  </label>
                </div>

                {/* Uploaded Images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploadingImages}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Item"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
