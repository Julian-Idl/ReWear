import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency (points)
export const formatPoints = (points: number): string => {
  return points.toLocaleString() + ' pts';
};

// Format relative time
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Format condition display
export const formatCondition = (condition: string): string => {
  return condition.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Generate avatar initials
export const getInitials = (name?: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// Validate file type and size
export const validateFile = (file: File, maxSize: number = 5 * 1024 * 1024, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']) => {
  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  return true;
};

// Generate random color for avatars
export const generateAvatarColor = (name?: string): string => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  
  if (!name) return colors[0];
  
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Calculate points for item based on condition and category
export const calculateItemPoints = (category: string, condition: string): number => {
  const basePoints: Record<string, number> = {
    DESIGNER: 200,
    FORMAL: 150,
    OUTERWEAR: 120,
    SHOES: 100,
    DRESSES: 100,
    TOPS: 80,
    BOTTOMS: 80,
    BAGS: 90,
    ACCESSORIES: 60,
    JEWELRY: 70,
    ACTIVEWEAR: 70,
    CASUAL: 60,
    VINTAGE: 180,
  };
  
  const conditionMultiplier: Record<string, number> = {
    EXCELLENT: 1.0,
    VERY_GOOD: 0.8,
    GOOD: 0.6,
    FAIR: 0.4,
    POOR: 0.2,
  };
  
  const base = basePoints[category] || 50;
  const multiplier = conditionMultiplier[condition] || 0.5;
  
  return Math.round(base * multiplier);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get error message from error object
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Format category for display
export const formatCategory = (category: string): string => {
  return category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Generate item URL
export const generateItemUrl = (id: string, title: string): string => {
  const slug = generateSlug(title);
  return `/items/${id}/${slug}`;
};

// Check if user can perform action
export const canUserPerformAction = (userRole: string, requiredRole: string): boolean => {
  const roleHierarchy: Record<string, number> = {
    USER: 1,
    MODERATOR: 2,
    ADMIN: 3,
  };
  
  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
};

// Generate pagination info
export const generatePaginationInfo = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex: (page - 1) * limit,
    endIndex: Math.min(page * limit - 1, total - 1),
  };
};
