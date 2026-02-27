import axios from 'axios';
import type {
  AuthResponse, RegisterRequest, LoginRequest, User,
  Category, Order, CreateOrderRequest, UpdateOrderStatusRequest,
  OrderStatusHistory, TimeSlot, Review, ReviewsResponse,
  CreateReviewRequest, Photo,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Добавляем токен к каждому запросу автоматически
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
    }
  } catch {}
  return config;
});

// =====================
// AUTH
// =====================
export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  me: () =>
    api.get<User>('/auth/me').then(r => r.data),
};

// =====================
// CATEGORIES
// =====================
export const categoriesApi = {
  getAll: () =>
    api.get<Category[]>('/categories').then(r => r.data),

  getById: (id: number) =>
    api.get<Category>(`/categories/${id}`).then(r => r.data),

  create: (data: { name: string; parent_id?: number | null; level: number; base_price: number }) =>
    api.post<Category>('/admin/categories', data).then(r => r.data),

  update: (id: number, data: { name: string; parent_id?: number | null; level: number; base_price: number }) =>
    api.put<Category>(`/admin/categories/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/admin/categories/${id}`).then(r => r.data),
};

// =====================
// ORDERS
// =====================
export const ordersApi = {
  create: (data: CreateOrderRequest) =>
    api.post<Order>('/orders', data).then(r => r.data),

  getAll: (statusId?: number) =>
    api.get<Order[]>('/orders', { params: statusId ? { status_id: statusId } : {} }).then(r => r.data),

  getById: (id: number) =>
    api.get<Order>(`/orders/${id}`).then(r => r.data),

  getHistory: (id: number) =>
    api.get<OrderStatusHistory[]>(`/orders/${id}/history`).then(r => r.data),

  updateStatus: (id: number, data: UpdateOrderStatusRequest) =>
    api.patch(`/admin/orders/${id}/status`, data).then(r => r.data),

  uploadPhoto: (orderId: number, file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post<Photo>(`/orders/${orderId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },

  getPhotos: (orderId: number) =>
    api.get<Photo[]>(`/orders/${orderId}/photos`).then(r => r.data),
};

// =====================
// TIME SLOTS
// =====================
export const slotsApi = {
  getFreeByDate: (date: string) =>
    api.get<TimeSlot[]>('/slots', { params: { date } }).then(r => r.data),

  create: (slot_date: string, slot_time: string) =>
    api.post<TimeSlot>('/admin/slots', { slot_date, slot_time }).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/admin/slots/${id}`).then(r => r.data),
};

// =====================
// REVIEWS
// =====================
export const reviewsApi = {
  getAll: () =>
    api.get<ReviewsResponse>('/reviews').then(r => r.data),

  create: (orderId: number, data: CreateReviewRequest) =>
    api.post<Review>(`/orders/${orderId}/reviews`, data).then(r => r.data),
};

export default api;