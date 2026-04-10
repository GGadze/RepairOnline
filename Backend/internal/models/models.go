package models

import (
	"time"
)

type User struct {
	ID           int       `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"`
	FirstName    string    `db:"first_name" json:"first_name"`
	LastName     string    `db:"last_name" json:"last_name"`
	Phone        string    `db:"phone" json:"phone"`
	AvatarID     *int      `db:"avatar_id" json:"avatar_id,omitempty"`
	Role         string    `db:"-" json:"role"`  // ← ДОБАВИТЬ ЭТУ СТРОКУ
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}

type Role struct {
	ID          int    `db:"id" json:"id"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
}

type UserRole struct {
	ID         int       `db:"id" json:"id"`
	UserID     int       `db:"user_id" json:"user_id"`
	RoleID     int       `db:"role_id" json:"role_id"`
	AssignedAt time.Time `db:"assigned_at" json:"assigned_at"`
}

type Category struct {
	ID        int        `db:"id" json:"id"`
	Name      string     `db:"name" json:"name"`
	ParentID  *int       `db:"parent_id" json:"parent_id"`
	Level     int        `db:"level" json:"level"`
	BasePrice float64    `db:"base_price" json:"base_price"`
	CreatedAt time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt time.Time  `db:"updated_at" json:"updated_at"`
	Children  []Category `db:"-" json:"children,omitempty"`
}

type Status struct {
	ID          int    `db:"id" json:"id"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
	ColorCode   string `db:"color_code" json:"color_code"`
}

type Order struct {
	ID                 int       `db:"id" json:"id"`
	UserID             int       `db:"user_id" json:"user_id"`
	CategoryID         *int      `db:"category_id" json:"category_id"`
	CustomDeviceName   *string   `db:"custom_device_name" json:"custom_device_name"`
	ProblemDescription string    `db:"problem_description" json:"problem_description"`
	FinalPrice         *float64  `db:"final_price" json:"final_price"`
	AppointmentDate    string    `db:"appointment_date" json:"appointment_date"`
	AppointmentTime    string    `db:"appointment_time" json:"appointment_time"`
	IsCustomDevice     bool      `db:"is_custom_device" json:"is_custom_device"`
	CreatedAt          time.Time `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time `db:"updated_at" json:"updated_at"`
	StatusName         *string   `db:"status_name" json:"status_name,omitempty"`
	ColorCode          *string   `db:"color_code" json:"color_code,omitempty"`
	UserName           *string   `db:"user_name" json:"user_name,omitempty"`
	CategoryName       *string   `db:"category_name" json:"category_name,omitempty"`
}

type TimeSlot struct {
	ID        int       `db:"id" json:"id"`
	SlotDate  string    `db:"slot_date" json:"slot_date"`
	SlotTime  string    `db:"slot_time" json:"slot_time"`
	IsBooked  bool      `db:"is_booked" json:"is_booked"`
	OrderID   *int      `db:"order_id" json:"order_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

type Photo struct {
	ID         int       `db:"id" json:"id"`
	OrderID    int       `db:"order_id" json:"order_id"`
	FilePath   string    `db:"file_path" json:"file_path"`
	FileName   string    `db:"file_name" json:"file_name"`
	UploadedAt time.Time `db:"uploaded_at" json:"uploaded_at"`
}

type Review struct {
	ID        int       `db:"id" json:"id"`
	OrderID   int       `db:"order_id" json:"order_id"`
	UserID    int       `db:"user_id" json:"user_id"`
	Rating    int       `db:"rating" json:"rating"`
	Comment   string    `db:"comment" json:"comment"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UserName  *string   `db:"user_name" json:"user_name,omitempty"`
}

type OrderStatusHistory struct {
	ID            int       `db:"id" json:"id"`
	OrderID       int       `db:"order_id" json:"order_id"`
	StatusID      int       `db:"status_id" json:"status_id"`
	ChangedBy     int       `db:"changed_by" json:"changed_by"`
	ChangedAt     time.Time `db:"changed_at" json:"changed_at"`
	StatusName    *string   `db:"status_name" json:"status_name,omitempty"`
	ChangedByName *string   `db:"changed_by_name" json:"changed_by_name,omitempty"`
}

// DTO

type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone" validate:"required"`
	CaptchaToken   string `json:"captcha_token"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateOrderRequest struct {
	CategoryID         *int    `json:"category_id"`
	CustomDeviceName   *string `json:"custom_device_name"`
	ProblemDescription string  `json:"problem_description" validate:"required"`
	AppointmentDate    string  `json:"appointment_date" validate:"required"`
	AppointmentTime    string  `json:"appointment_time" validate:"required"`
	IsCustomDevice     bool    `json:"is_custom_device"`
}

type UpdateOrderStatusRequest struct {
	StatusID int    `json:"status_id" validate:"required"`
	Comment  string `json:"comment"`
}

type CreateReviewRequest struct {
	Rating  int    `json:"rating" validate:"required,min=1,max=5"`
	Comment string `json:"comment"`
}

type CreateCategoryRequest struct {
	Name      string  `json:"name" validate:"required"`
	ParentID  *int    `json:"parent_id"`
	Level     int     `json:"level"`
	BasePrice float64 `json:"base_price"`
}

type CreateSlotRequest struct {
	SlotDate string `json:"slot_date" validate:"required"`
	SlotTime string `json:"slot_time" validate:"required"`
}

type UpdateAvatarRequest struct {
	AvatarID int `json:"avatar_id" validate:"required,min=1,max=10"`
}

// UpdateProfileRequest — PUT /auth/profile
type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
	Email     string `json:"email"`
}

// ChangePasswordRequest — PUT /auth/password
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

type JWTClaims struct {
	UserID int    `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

type SuccessResponse struct {
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// Добавить в конец файла internal/models/models.go

// ---- Order Services ----

type OrderService struct {
	ID           int       `db:"id" json:"id"`
	OrderID      int       `db:"order_id" json:"order_id"`
	CategoryID   int       `db:"category_id" json:"category_id"`
	Price        float64   `db:"price" json:"price"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	// Joined
	ServiceName *string `db:"service_name" json:"service_name,omitempty"`
}

type AddOrderServicesRequest struct {
	Services []OrderServiceItem `json:"services" validate:"required"`
}

type OrderServiceItem struct {
	CategoryID int     `json:"category_id" validate:"required"`
	Price      float64 `json:"price"`
}

// ---- Analytics ----

type AdminStats struct {
	TotalOrders      int     `json:"total_orders"`
	MonthlyRevenue   float64 `json:"monthly_revenue"`
	TotalRevenue     float64 `json:"total_revenue"`
	ActiveOrders     int     `json:"active_orders"`
	CompletedOrders  int     `json:"completed_orders"`
}

type UserRevenue struct {
	UserID    int     `db:"user_id" json:"user_id"`
	UserName  string  `db:"user_name" json:"user_name"`
	Email     string  `db:"email" json:"email"`
	TotalOrders int   `db:"total_orders" json:"total_orders"`
	Revenue   float64 `db:"revenue" json:"revenue"`
}

type MonthlyRevenue struct {
	Month   string  `db:"month" json:"month"`
	Revenue float64 `db:"revenue" json:"revenue"`
	Orders  int     `db:"orders" json:"orders"`
}

// ---- Chat ----

type ChatConversation struct {
	ID        int       `db:"id" json:"id"`
	UserID    int       `db:"user_id" json:"user_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`
	// Joined
	UserName     *string `db:"user_name" json:"user_name,omitempty"`
	LastMessage  *string `db:"last_message" json:"last_message,omitempty"`
	UnreadCount  int     `db:"unread_count" json:"unread_count"`
}

type ChatMessage struct {
	ID             int       `db:"id" json:"id"`
	ConversationID int       `db:"conversation_id" json:"conversation_id"`
	SenderID       int       `db:"sender_id" json:"sender_id"`
	IsFromAdmin    bool      `db:"is_from_admin" json:"is_from_admin"`
	Message        string    `db:"message" json:"message"`
	IsRead         bool      `db:"is_read" json:"is_read"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
	// Joined
	SenderName *string `db:"sender_name" json:"sender_name,omitempty"`
}

type SendMessageRequest struct {
	Message string `json:"message" validate:"required"`
}