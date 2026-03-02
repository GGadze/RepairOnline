package models

import (
	"time"
)

// --- Users ---

type User struct {
	ID           int       `db:"id" json:"id"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"-"`
	FirstName    string    `db:"first_name" json:"first_name"`
	LastName     string    `db:"last_name" json:"last_name"`
	Phone        string    `db:"phone" json:"phone"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
}

// --- Roles ---

type Role struct {
	ID          int    `db:"id" json:"id"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
}

// --- UserRoles ---

type UserRole struct {
	ID         int       `db:"id" json:"id"`
	UserID     int       `db:"user_id" json:"user_id"`
	RoleID     int       `db:"role_id" json:"role_id"`
	AssignedAt time.Time `db:"assigned_at" json:"assigned_at"`
}

// --- Categories ---

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

// --- Statuses ---

type Status struct {
	ID          int    `db:"id" json:"id"`
	Name        string `db:"name" json:"name"`
	Description string `db:"description" json:"description"`
	ColorCode   string `db:"color_code" json:"color_code"`
}

// --- Orders ---

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

	// Joined fields — *string чтобы принимать NULL из LEFT JOIN
	StatusName   *string `db:"status_name" json:"status_name,omitempty"`
	ColorCode    *string `db:"color_code" json:"color_code,omitempty"`
	UserName     *string `db:"user_name" json:"user_name,omitempty"`
	CategoryName *string `db:"category_name" json:"category_name,omitempty"`
}

// --- TimeSlots ---

type TimeSlot struct {
	ID        int       `db:"id" json:"id"`
	SlotDate  string    `db:"slot_date" json:"slot_date"`
	SlotTime  string    `db:"slot_time" json:"slot_time"`
	IsBooked  bool      `db:"is_booked" json:"is_booked"`
	OrderID   *int      `db:"order_id" json:"order_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

// --- Photos ---

type Photo struct {
	ID         int       `db:"id" json:"id"`
	OrderID    int       `db:"order_id" json:"order_id"`
	FilePath   string    `db:"file_path" json:"file_path"`
	FileName   string    `db:"file_name" json:"file_name"`
	UploadedAt time.Time `db:"uploaded_at" json:"uploaded_at"`
}

// --- Reviews ---

type Review struct {
	ID        int       `db:"id" json:"id"`
	OrderID   int       `db:"order_id" json:"order_id"`
	UserID    int       `db:"user_id" json:"user_id"`
	Rating    int       `db:"rating" json:"rating"`
	Comment   string    `db:"comment" json:"comment"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`

	// Joined fields
	UserName *string `db:"user_name" json:"user_name,omitempty"`
}

// --- OrderStatusHistory ---

type OrderStatusHistory struct {
	ID        int       `db:"id" json:"id"`
	OrderID   int       `db:"order_id" json:"order_id"`
	StatusID  int       `db:"status_id" json:"status_id"`
	ChangedBy int       `db:"changed_by" json:"changed_by"`
	ChangedAt time.Time `db:"changed_at" json:"changed_at"`

	// Joined fields
	StatusName    *string `db:"status_name" json:"status_name,omitempty"`
	ChangedByName *string `db:"changed_by_name" json:"changed_by_name,omitempty"`
}

// --- DTO (Data Transfer Objects) ---

type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone" validate:"required"`
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