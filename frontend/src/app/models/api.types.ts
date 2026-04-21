export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  parentCategoryId?: number | null;
  /** Percentage off regular price for products in this category (and ancestors when pricing). */
  saleDiscountPercent?: number | null;
  saleStartUtc?: string | null;
  saleEndUtc?: string | null;
  children: CategoryDto[];
  productCount?: number | null;
  products?: ProductListDto[] | null;
}

export interface BannerDto {
  id: number;
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface SaveBannerRequest {
  title: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export interface ProductImageDto {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
  altText?: string | null;
}

export interface ProductListDto {
  id: number;
  name: string;
  slug: string;
  sku: string;
  regularPrice: number;
  salePrice?: number | null;
  saleStartUtc?: string | null;
  saleEndUtc?: string | null;
  isFeatured: boolean;
  isNew: boolean;
  primaryImageUrl?: string | null;
  /** Same as primary image (API convenience). */
  imageUrl?: string | null;
  isOnSale?: boolean;
  isActive?: boolean;
}

export interface ProductDetailDto extends ProductListDto {
  description?: string | null;
  sku: string;
  primaryCategoryId?: number | null;
  stockQuantity: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  images: ProductImageDto[];
  categories: CategorySummaryDto[];
}

export interface CategorySummaryDto {
  id: number;
  name: string;
  slug: string;
  parentCategoryId?: number | null;
}

/** Admin create/update category (matches API body). */
export interface SaveCategoryRequest {
  name: string;
  slug: string;
  parentCategoryId?: number | null;
  description?: string | null;
  isActive: boolean;
  displayOrder: number;
  imageUrl?: string | null;
  metadata?: string | null;
  saleDiscountPercent?: number | null;
  saleStartUtc?: string | null;
  saleEndUtc?: string | null;
}

/** Admin create/update product (matches API body). */
export interface SaveProductRequest {
  name: string;
  slug: string;
  description?: string | null;
  regularPrice: number;
  salePrice?: number | null;
  sku: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  categoryId?: number | null;
  categoryIds: number[];
  primaryCategoryId?: number | null;
  /** Omit on update to leave images unchanged; empty string clears. */
  imageUrl?: string | null;
  saleStartUtc?: string | null;
  saleEndUtc?: string | null;
}

export interface PagedResultDto<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CartItemDto {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartDto {
  cartIdentifier: string;
  items: CartItemDto[];
  subtotal: number;
  total: number;
  totalQuantity: number;
}

export interface CreateOrderDto {
  cartIdentifier: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode?: string | null;
  notes?: string | null;
}

export interface OrderDetailDto {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode?: string | null;
  orderTotal: number;
  orderStatus: string;
  paymentMethod: string;
  notes?: string | null;
  createdAt: string;
  items: OrderItemDto[];
}

export interface OrderItemDto {
  productName: string;
  productImageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}
