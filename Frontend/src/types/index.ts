// ---- Auth ----

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  avatar_id: number
  role: 'admin' | 'user' | 'master'  // ← Добавить
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  captcha_token: string;
}

export interface LoginRequest {
  email: string
  password: string
}

// ---- Categories ----

export interface Category {
  id: number
  name: string
  parent_id: number | null
  level: number
  base_price: number
  created_at: string
  updated_at: string
  children?: Category[]
}

// ---- Orders ----

export interface Order {
  id: number
  user_id: number
  category_id: number | null
  custom_device_name: string | null
  problem_description: string
  final_price: number | null
  appointment_date: string
  appointment_time: string
  is_custom_device: boolean
  created_at: string
  updated_at: string
  // joined fields
  status_name: string
  color_code: string
  user_name: string
  category_name: string
}

export interface CreateOrderRequest {
  category_id?: number | null
  custom_device_name?: string | null
  problem_description: string
  appointment_date: string
  appointment_time: string
  is_custom_device: boolean
  final_price?: number | null // 👈 ДОБАВИТЬ
}
export interface UpdateOrderStatusRequest {
  status_id: number
  comment?: string
}

// ---- Status History ----

export interface OrderStatusHistory {
  id: number
  order_id: number
  status_id: number
  changed_by: number
  changed_at: string
  status_name: string
  changed_by_name: string
}

// ---- Time Slots ----
export interface TimeSlot {
  id: number
  slot_date: string
  slot_time: string
  is_booked: boolean
  order_id: number | null
  created_at: string
}

// ---- Reviews ----

export interface Review {
  id: number
  order_id: number
  user_id: number
  rating: number
  comment: string
  created_at: string
  user_name: string
}

export interface ReviewsResponse {
  reviews: Review[]
  avg_rating: number
}

export interface CreateReviewRequest {
  rating: number
  comment: string
}

// ---- Photos ----

export interface Photo {
  id: number
  order_id: number
  file_path: string
  file_name: string
  uploaded_at: string
}

// ---- Status ----

export interface Status {
  id: number
  name: string
  description: string
  color_code: string
}
// Добавить в файл src/types/index.ts

// ---- Analytics ----

export interface AdminStats {
  total_orders: number
  monthly_revenue: number
  total_revenue: number
  active_orders: number
  completed_orders: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
}

export interface UserRevenue {
  user_id: number
  user_name: string
  email: string
  total_orders: number
  revenue: number
}

// ---- Chat ----

export interface ChatConversation {
  id: number
  user_id: number
  user_name: string
  last_message: string | null
  unread_count: number
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  conversation_id: number
  sender_id: number
  sender_name: string
  is_from_admin: boolean
  message: string
  is_read: boolean
  created_at: string
}

// ---- Order Services ----

export interface OrderService {
  id: number
  order_id: number
  category_id: number
  service_name: string
  price: number
  created_at: string
}


// ---- Analytics ----

export interface AdminStats {
  total_orders: number
  monthly_revenue: number
  total_revenue: number
  active_orders: number
  completed_orders: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  orders: number
}

export interface UserRevenue {
  user_id: number
  user_name: string
  email: string
  total_orders: number
  revenue: number
}

// ---- Chat ----

export interface ChatConversation {
  id: number
  user_id: number
  user_name: string
  last_message: string | null
  unread_count: number
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: number
  conversation_id: number
  sender_id: number
  sender_name: string
  is_from_admin: boolean
  message: string
  is_read: boolean
  created_at: string
}

// ---- Order Services ----

export interface OrderService {
  id: number
  order_id: number
  category_id: number
  service_name: string
  price: number
  created_at: string
}