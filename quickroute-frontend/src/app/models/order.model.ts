export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface CreateOrderRequest {
  restaurantId: string;
  deliveryAddress: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
}

export interface Order {
  id: string;
  customerId: string;
  driverId?: string;
  restaurantId: string;
  deliveryAddress: string;
  status: 'CREATED' | 'PENDING_PAYMENT' | 'PAID' | 'PREPARING' | 'READY_FOR_PICKUP' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export interface DriverLocation {
  driverId: string;
  currentOrderId: string;
  location?: { coordinates?: number[]; x?: number; y?: number } | null;
  updatedAt?: string;
}
