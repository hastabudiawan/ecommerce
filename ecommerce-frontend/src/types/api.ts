// ---------- Umum ----------

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

// ---------- Autentikasi dan akun ----------

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

export interface Account {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  hasStore: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface UpdateProfileRequest {
  name: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ---------- Admin: manajemen pengguna ----------

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  enabled: boolean;
  hasStore: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}

// ---------- Produk, kategori, dan ulasan ----------

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
  discountPercent: number;
  finalPrice: number;
  stock: number;
  ratingAverage: number;
  reviewCount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";
  rejectionReason: string | null;
  variants: Variant[];
  images: ProductImage[];
  createdAt: string;
}

export interface ProductRequest {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  discountPercent?: number;
  stock: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  authorName: string;
  createdAt: string;
}

export interface ReviewEligibility {
  canReview: boolean;
  reason: string | null;
  myReview: Review | null;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

// ---------- Toko ----------

export interface SellerStore {
  id: number;
  storeName: string;
  slug: string;
  description: string | null;
  city: string | null;
  shippingFee: number;
}

export interface CreateStoreRequest {
  storeName: string;
  description?: string;
  city?: string;
}

export interface UpdateStoreRequest {
  storeName: string;
  city?: string;
  description?: string;
  shippingFee: number;
}

// ---------- Keranjang ----------

export interface CartItemDto {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  storeId: number | null;
  storeName: string | null;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
  stock: number;
  variantId: number | null;
  variantLabel: string | null;
  available: boolean;
}

export interface CartDto {
  id: number | null;
  items: CartItemDto[];
  totalPrice: number;
  totalItems: number;
}

export interface AddCartItemRequest {
  productId: number;
  variantId?: number;
  quantity: number;
}

// ---------- Alamat ----------

export interface Address {
  id: number;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

export interface CreateAddressRequest {
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

// ---------- Checkout dan pesanan ----------

export interface CheckoutRequest {
  addressId: number;
}

export interface StorePreview {
  storeId: number | null;
  storeName: string;
  subtotal: number;
  shippingCost: number;
}

export interface CheckoutPreview {
  stores: StorePreview[];
  subtotal: number;
  shippingCost: number;
  total: number;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export interface OrderItem {
  productId: number;
  productName: string;
  priceSnapshot: number;
  quantity: number;
  variantLabel: string | null;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  storeId: number | null;
  storeName: string | null;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  recipientName: string;
  shippingAddress: string;
  createdAt: string;
}

export interface OrderGroup {
  id: number;
  groupNumber: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  recipientName: string;
  shippingAddress: string;
  orders: Order[];
  createdAt: string;
}

// ---------- Settlement ----------

export type SettlementStatus = "PENDING" | "RELEASED";

export interface Settlement {
  id: number;
  orderNumber: string;
  storeName: string;
  amount: number;
  status: SettlementStatus;
  createdAt: string;
  releasedAt: string | null;
}

export interface SettlementSummary {
  totalPending: number;
  totalReleased: number;
}

export interface Variant {
  id: number;
  colorName: string | null;
  colorHex: string | null;
  size: string | null;
  stock: number;
  label: string;
}

export interface VariantRequest {
  id?: number;
  colorName?: string;
  colorHex?: string;
  size?: string;
  stock: number;
}