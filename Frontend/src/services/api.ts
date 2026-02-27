import axios from 'axios';

// Базовый URL для API (замени на свой, когда бэкенд будет готов)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API для авторизации
export const authApi = {
  login: (login: string, password: string) => 
    api.post('/auth/login', { login, password }),
  register: (userData: any) => 
    api.post('/auth/register', userData),
  logout: () => 
    api.post('/auth/logout'),
  getProfile: () => 
    api.get('/auth/profile'),
};

// API для заказов
export const ordersApi = {
  getAll: (params?: any) => 
    api.get('/orders', { params }),
  getById: (id: number) => 
    api.get(`/orders/${id}`),
  create: (orderData: any) => 
    api.post('/orders', orderData),
  update: (id: number, orderData: any) => 
    api.put(`/orders/${id}`, orderData),
  delete: (id: number) => 
    api.delete(`/orders/${id}`),
  getHistory: () => 
    api.get('/orders/history'),
  addReview: (id: number, reviewData: any) => 
    api.post(`/orders/${id}/review`, reviewData),
};

// API для категорий
export const categoriesApi = {
  getAll: () => 
    api.get('/categories'),
  getById: (id: number) => 
    api.get(`/categories/${id}`),
  getWithServices: () => 
    api.get('/categories/with-services'),
};

// API для услуг
export const servicesApi = {
  getAll: (params?: any) => 
    api.get('/services', { params }),
  getByCategory: (categoryId: number) => 
    api.get(`/services/category/${categoryId}`),
};

// API для отзывов
export const reviewsApi = {
  getAll: (params?: any) => 
    api.get('/reviews', { params }),
  create: (reviewData: any) => 
    api.post('/reviews', reviewData),
  getByOrderId: (orderId: number) => 
    api.get(`/reviews/order/${orderId}`),
};

// API для временных слотов
export const slotsApi = {
  getAvailable: (date: string) => 
    api.get('/slots/available', { params: { date } }),
  getByDate: (date: string) => 
    api.get(`/slots/${date}`),
  bookSlot: (slotId: number) => 
    api.post(`/slots/${slotId}/book`),
};

// API для пользователей
export const usersApi = {
  getProfile: () => 
    api.get('/users/profile'),
  updateProfile: (userData: any) => 
    api.put('/users/profile', userData),
  changePassword: (passwords: any) => 
    api.post('/users/change-password', passwords),
};

export default api;