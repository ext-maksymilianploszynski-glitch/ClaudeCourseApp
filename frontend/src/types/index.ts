export interface Product {
  id: number;
  name: string;
  sku: string;
  category?: string;
  unit: string;
  price?: number;
  lowStockThreshold: number;
  currentStock: number;
  isLowStock: boolean;
  createdAt: string;
}

export interface ProductRequest {
  name: string;
  sku: string;
  category?: string;
  unit: string;
  price?: number;
  lowStockThreshold: number;
}

export type OrderType = 'Incoming' | 'Outgoing';
export type OrderStatus = 'Draft' | 'Confirmed' | 'Completed';

export interface OrderListItem {
  id: number;
  type: OrderType;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  itemCount: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSKU: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  type: OrderType;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  items: OrderItem[];
}

export interface OrderRequest {
  type: OrderType;
  notes?: string;
}

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}
