export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string;
  storeId: number | null;
  storeName: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  images: ProductImage[];
  createdAt: string;
}

export type UserRole = "ADMIN" | "CUSTOMER" | "SELLER";

export interface AuthUser {
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse extends AuthUser {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}