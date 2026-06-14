import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== Auth API ====================
export const authAPI = {
  register: (name: string, email: string, password: string, phone?: string) =>
    api.post('/auth/register', { name, email, password, phone }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  updateMe: (data: { name?: string; phone?: string }) =>
    api.put('/auth/me', data),

  updatePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgotpassword', { email }),

  resetPassword: (token: string, password: string) =>
    api.put(`/auth/resetpassword/${token}`, { password }),
};

// ==================== Products API ====================
export const productsAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    featured?: boolean;
    search?: string;
    sort?: string;
    fields?: string;
  }) => api.get('/products', { params }),

  getFeatured: () => api.get('/products/featured'),

  getOne: (id: string) => api.get(`/products/${id}`),

  getByCategory: (categoryId: string, params?: Record<string, unknown>) =>
    api.get(`/products/category/${categoryId}`, { params }),

  search: (query: string) => api.get('/products/search', { params: { q: query } }),

  getRelated: (id: string) => api.get(`/products/${id}/related`),
};

// ==================== Categories API ====================
export const categoriesAPI = {
  getAll: () => api.get('/categories'),

  getOne: (id: string) => api.get(`/categories/${id}`),

  getTree: () => api.get('/categories/tree'),
};

// ==================== Cart API ====================
export const cartAPI = {
  get: () => api.get('/cart'),

  add: (productId: string, quantity: number = 1) =>
    api.post('/cart', { productId, quantity }),

  update: (productId: string, quantity: number) =>
    api.put(`/cart/${productId}`, { quantity }),

  remove: (productId: string) => api.delete(`/cart/${productId}`),

  clear: () => api.delete('/cart'),

  applyCoupon: (code: string) => api.post('/cart/coupon', { code }),

  removeCoupon: () => api.delete('/cart/coupon'),
};

// ==================== Wishlist API ====================
export const wishlistAPI = {
  get: () => api.get('/wishlist'),

  add: (productId: string) => api.post('/wishlist', { productId }),

  remove: (productId: string) => api.delete(`/wishlist/${productId}`),

  clear: () => api.delete('/wishlist'),

  moveToCart: (productId: string) =>
    api.post(`/wishlist/${productId}/move-to-cart`),
};

// ==================== Orders API ====================
export const ordersAPI = {
  getAll: (params?: { status?: string }) => api.get('/orders', { params }),

  getOne: (id: string) => api.get(`/orders/${id}`),

  getByNumber: (orderNumber: string) => api.get(`/orders/number/${orderNumber}`),

  create: (data: {
    shippingAddress: {
      type: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: string;
    notes?: string;
  }) => api.post('/orders', data),

  cancel: (id: string) => api.put(`/orders/${id}/cancel`),
};

// ==================== Reviews API ====================
export const reviewsAPI = {
  getByProduct: (productId: string, params?: { limit?: number }) =>
    api.get('/reviews', { params: { productId, ...params } }),

  getOne: (id: string) => api.get(`/reviews/${id}`),

  create: (data: {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
  }) => api.post('/reviews', data),

  update: (id: string, data: { rating?: number; title?: string; comment?: string }) =>
    api.put(`/reviews/${id}`, data),

  delete: (id: string) => api.delete(`/reviews/${id}`),

  markHelpful: (id: string) => api.put(`/reviews/${id}/helpful`),
};

// ==================== Admin API ====================
export const adminAPI = {
  // Stats
  getStats: () => api.get('/admin/stats'),

  // Products
  getProducts: (params?: Record<string, unknown>) =>
    api.get('/admin/products', { params }),

  createProduct: (data: FormData) =>
    api.post('/admin/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateProduct: (id: string, data: FormData) =>
    api.put(`/admin/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),

  deleteProductImage: (productId: string, imageId: string) =>
    api.delete(`/admin/products/${productId}/images/${imageId}`),

  // Users
  getUsers: (params?: Record<string, unknown>) =>
    api.get('/admin/users', { params }),

  getUser: (id: string) => api.get(`/admin/users/${id}`),

  updateUser: (id: string, data: { name?: string; role?: string; isActive?: boolean }) =>
    api.put(`/admin/users/${id}`, data),

  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),

  // Orders
  getOrders: (params?: Record<string, unknown>) =>
    api.get('/admin/orders', { params }),

  updateOrderStatus: (id: string, status: string, trackingNumber?: string) =>
    api.put(`/admin/orders/${id}`, { status, trackingNumber }),

  // Categories
  createCategory: (formData: FormData) =>
    api.post('/admin/categories', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateCategory: (id: string, data: Record<string, unknown>) =>
    api.put(`/admin/categories/${id}`, data),

  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),
};

// ==================== Health Check ====================
export const healthCheck = () => api.get('/health');

export default api;
