import { API } from "./axios";
import type { Order } from "../orderServices";

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
