import { z } from 'zod';
import { Category, Condition, UserRole, SwapType } from '@/types';

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// User profile validation schema
export const userProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional(),
});

// Item validation schema
export const itemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.nativeEnum(Category),
  subcategory: z.string().optional(),
  brand: z.string().max(50, 'Brand must be less than 50 characters').optional(),
  size: z.string().min(1, 'Size is required').max(20, 'Size must be less than 20 characters'),
  condition: z.nativeEnum(Condition),
  color: z.string().max(30, 'Color must be less than 30 characters').optional(),
  material: z.string().max(50, 'Material must be less than 50 characters').optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  pointValue: z.number().min(10, 'Point value must be at least 10').max(1000, 'Point value must be less than 1000'),
});

// Swap request validation schema
export const swapRequestSchema = z.object({
  receiverId: z.string().cuid('Invalid receiver ID'),
  senderItemId: z.string().cuid('Invalid sender item ID'),
  receiverItemId: z.string().cuid('Invalid receiver item ID').optional(),
  type: z.nativeEnum(SwapType),
  message: z.string().max(500, 'Message must be less than 500 characters').optional(),
});

// Message validation schema
export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message must be less than 1000 characters'),
  receiverId: z.string().cuid('Invalid receiver ID'),
  swapRequestId: z.string().cuid('Invalid swap request ID').optional(),
});

// Admin schemas
export const updateUserRoleSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  role: z.nativeEnum(UserRole),
});

export const moderateItemSchema = z.object({
  itemId: z.string().cuid('Invalid item ID'),
  action: z.enum(['approve', 'reject']),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
});

// Search and filter schemas
export const itemFiltersSchema = z.object({
  category: z.nativeEnum(Category).optional(),
  condition: z.nativeEnum(Condition).optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  brand: z.string().optional(),
  minPoints: z.number().min(0).optional(),
  maxPoints: z.number().min(0).optional(),
  search: z.string().optional(),
  featured: z.boolean().optional(),
  available: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(12),
});

export const userFiltersSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  verified: z.boolean().optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// Point transaction schema
export const pointTransactionSchema = z.object({
  userId: z.string().cuid('Invalid user ID'),
  amount: z.number().int('Amount must be an integer'),
  description: z.string().min(1, 'Description is required').max(200, 'Description must be less than 200 characters'),
});

// Review schema
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().max(500, 'Comment must be less than 500 characters').optional(),
  targetId: z.string().cuid('Invalid target user ID'),
});

// Email validation
export const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Password reset schemas
export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// File upload schema
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a valid file' }),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp']),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UserProfileFormData = z.infer<typeof userProfileSchema>;
export type ItemFormData = z.infer<typeof itemSchema>;
export type SwapRequestFormData = z.infer<typeof swapRequestSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type ItemFiltersData = z.infer<typeof itemFiltersSchema>;
export type UserFiltersData = z.infer<typeof userFiltersSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
