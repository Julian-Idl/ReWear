// Global type definitions for the ReWear platform

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  points: number;
  role: UserRole;
  verified: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: Category;
  subcategory?: string;
  brand?: string;
  size: string;
  condition: Condition;
  color?: string;
  material?: string;
  tags: string[];
  pointValue: number;
  status: ItemStatus;
  available: boolean;
  featured: boolean;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface SwapRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderItemId: string;
  receiverItemId?: string;
  type: SwapType;
  status: SwapRequestStatus;
  message?: string;
  sender?: User;
  receiver?: User;
  senderItem?: Item;
  receiverItem?: Item;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  swapRequestId?: string;
  read: boolean;
  sender?: User;
  receiver?: User;
  createdAt: Date;
}

export interface PointTransaction {
  id: string;
  userId: string;
  itemId?: string;
  amount: number;
  type: PointTransactionType;
  description: string;
  user?: User;
  item?: Item;
  createdAt: Date;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  authorId: string;
  targetId: string;
  author?: User;
  target?: User;
  createdAt: Date;
}

// Enums
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum Category {
  TOPS = 'TOPS',
  BOTTOMS = 'BOTTOMS',
  DRESSES = 'DRESSES',
  OUTERWEAR = 'OUTERWEAR',
  SHOES = 'SHOES',
  ACCESSORIES = 'ACCESSORIES',
  BAGS = 'BAGS',
  JEWELRY = 'JEWELRY',
  ACTIVEWEAR = 'ACTIVEWEAR',
  FORMAL = 'FORMAL',
  CASUAL = 'CASUAL',
  VINTAGE = 'VINTAGE',
  DESIGNER = 'DESIGNER'
}

export enum Condition {
  EXCELLENT = 'EXCELLENT',
  VERY_GOOD = 'VERY_GOOD',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export enum ItemStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SOLD = 'SOLD',
  REMOVED = 'REMOVED'
}

export enum SwapType {
  DIRECT = 'DIRECT',
  POINTS = 'POINTS'
}

export enum SwapRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PointTransactionType {
  EARNED_LISTING = 'EARNED_LISTING',
  EARNED_SWAP = 'EARNED_SWAP',
  SPENT_REDEMPTION = 'SPENT_REDEMPTION',
  BONUS = 'BONUS',
  PENALTY = 'PENALTY'
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ItemFormData {
  title: string;
  description: string;
  category: Category;
  subcategory?: string;
  brand?: string;
  size: string;
  condition: Condition;
  color?: string;
  material?: string;
  tags: string[];
  pointValue: number;
  images: File[];
}

export interface UserProfileFormData {
  name?: string;
  bio?: string;
  phone?: string;
  avatar?: File;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and search types
export interface ItemFilters {
  category?: Category;
  condition?: Condition;
  size?: string;
  color?: string;
  brand?: string;
  minPoints?: number;
  maxPoints?: number;
  search?: string;
  featured?: boolean;
  available?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  verified?: boolean;
  active?: boolean;
  search?: string;
}

// Dashboard stats types
export interface DashboardStats {
  totalItems: number;
  activeSwaps: number;
  completedSwaps: number;
  totalPoints: number;
  pointsEarned: number;
  pointsSpent: number;
}

export interface AdminStats {
  totalUsers: number;
  totalItems: number;
  pendingItems: number;
  totalSwaps: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'swap_request' | 'swap_accepted' | 'swap_rejected' | 'item_approved' | 'item_rejected' | 'message';
  title: string;
  message: string;
  read: boolean;
  data?: any;
  createdAt: Date;
}

// Upload types
export interface UploadedImage {
  id: string;
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}
