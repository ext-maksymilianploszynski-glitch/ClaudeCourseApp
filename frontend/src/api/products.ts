import client from './client';
import type { Product, ProductRequest } from '../types';

export const getProducts = () =>
  client.get<Product[]>('/products').then(r => r.data);

export const getProduct = (id: number) =>
  client.get<Product>(`/products/${id}`).then(r => r.data);

export const createProduct = (data: ProductRequest) =>
  client.post<Product>('/products', data).then(r => r.data);

export const updateProduct = (id: number, data: ProductRequest) =>
  client.put<Product>(`/products/${id}`, data).then(r => r.data);

export const deleteProduct = (id: number) =>
  client.delete(`/products/${id}`);
