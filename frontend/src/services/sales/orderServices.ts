import API from "@/api/axios";

export interface OrderProduct {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  contactPerson: string;
  email: string;
  phone: string;
  billingAddress: string;
  shippingAddress: string;
  salesRep: string;
  salesRepAvatar?: string;
  orderDate: string;
  deliveryDate: string;
  totalItems: number;
  totalQuantity: number;
  orderValue: number;
  paymentStatus: "Unpaid" | "Partially Paid" | "Paid" | "Refunded";
  deliveryStatus: "Pending" | "Packed" | "Shipped" | "Delivered";
  orderStatus: "Draft" | "Pending" | "Approved" | "Processing" | "Shipped" | "Delivered" | "Completed" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Urgent";
  lastUpdated: string;
  products: OrderProduct[];
  notes: { internal: string; customer: string };
}

export const createOrder = async (slug: string, payload: Partial<Order>): Promise<{ success: boolean; data: Order; message?: string }> => {
  const res = await API.post(`/orders/${slug}/create-order`, payload);
  return res.data;
};

export const getOrders = async (slug: string): Promise<{ success: boolean; data: Order[] }> => {
  const res = await API.get(`/orders/${slug}/get-all-orders`);
  return res.data;
};

export const getOrderById = async (orderId: string, slug: string): Promise<{ success: boolean; data: Order }> => {
  const res = await API.get(`/orders/${slug}/get-orders/${orderId}`);
  return res.data;
};

export const updateOrder = async (orderId: string, payload: Partial<Order>, slug: string): Promise<{ success: boolean; data: Order; message?: string }> => {
  const res = await API.put(`/orders/${slug}/get-orders/${orderId}`, payload);
  return res.data;
};

export const deleteOrder = async (orderId: string, slug: string): Promise<{ success: boolean; message?: string }> => {
  const res = await API.delete(`/orders/${slug}/get-orders/${orderId}`);
  return res.data;
};

export const emailCustomerOrder = async (orderId: string, slug: string): Promise<{ success: boolean; message?: string }> => {
  const res = await API.post(`/orders/${slug}/get-orders/${orderId}/email`);
  return res.data;
};