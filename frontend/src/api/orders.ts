import client from './client';
import type { Order, OrderListItem, OrderRequest, OrderItemRequest, OrderItem } from '../types';

export const getOrders = (params?: { type?: string; status?: string }) =>
  client.get<OrderListItem[]>('/orders', { params }).then(r => r.data);

export const getOrder = (id: number) =>
  client.get<Order>(`/orders/${id}`).then(r => r.data);

export const createOrder = (data: OrderRequest) =>
  client.post<Order>('/orders', data).then(r => r.data);

export const updateOrder = (id: number, data: Partial<OrderRequest>) =>
  client.put<Order>(`/orders/${id}`, data).then(r => r.data);

export const deleteOrder = (id: number) =>
  client.delete(`/orders/${id}`);

export const confirmOrder = (id: number) =>
  client.post<Order>(`/orders/${id}/confirm`).then(r => r.data);

export const completeOrder = (id: number) =>
  client.post<Order>(`/orders/${id}/complete`).then(r => r.data);

export const addOrderItem = (orderId: number, data: OrderItemRequest) =>
  client.post<OrderItem>(`/orders/${orderId}/items`, data).then(r => r.data);

export const updateOrderItem = (orderId: number, itemId: number, data: OrderItemRequest) =>
  client.put<OrderItem>(`/orders/${orderId}/items/${itemId}`, data).then(r => r.data);

export const deleteOrderItem = (orderId: number, itemId: number) =>
  client.delete(`/orders/${orderId}/items/${itemId}`);
