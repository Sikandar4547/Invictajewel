export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  parentCategoryId?: number | null;
  children: CategoryDto[];
  productCount?: number | null;
  products?: ProductListDto[] | null;
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
  regularPrice: number;
  salePrice?: number | null;
  isFeatured: boolean;
  isNew: boolean;
  primaryImageUrl?: string | null;
  isOnSale?: boolean;
  isActive?: boolean;
}

export interface ProductDetailDto extends ProductListDto {
  description?: string | null;
  sku: string;
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
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}
