package handlers

import (
	"strconv"

	"github.com/GGadze/RepairOnline/internal/middleware"
	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/GGadze/RepairOnline/internal/services"
	"github.com/gofiber/fiber/v2"
)

type OrderHandler struct {
	orderService *services.OrderService
}

func NewOrderHandler(orderService *services.OrderService) *OrderHandler {
	return &OrderHandler{orderService: orderService}
}

// POST /api/orders
func (h *OrderHandler) Create(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req models.CreateOrderRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	order, err := h.orderService.Create(userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(order)
}

// GET /api/orders — для клиента: только свои; для админа: все
func (h *OrderHandler) List(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	var orders []models.Order
	var err error

	if role == "admin" {
		statusID, _ := strconv.Atoi(c.Query("status_id"))
		orders, err = h.orderService.ListAll(statusID)
	} else {
		orders, err = h.orderService.ListByUser(userID)
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(orders)
}

// GET /api/orders/:id
func (h *OrderHandler) Get(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	order, err := h.orderService.GetByID(id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
	}

	// Клиент может смотреть только свои заказы
	if role != "admin" && order.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}

	return c.JSON(order)
}

// PATCH /api/orders/:id/status — только админ
func (h *OrderHandler) UpdateStatus(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	adminID := middleware.GetUserID(c)

	var req models.UpdateOrderStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := h.orderService.UpdateStatus(id, adminID, &req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Status updated"})
}

// GET /api/orders/:id/history
func (h *OrderHandler) GetHistory(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	history, err := h.orderService.GetStatusHistory(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(history)
}

// POST /api/orders/:id/photos
func (h *OrderHandler) UploadPhoto(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	file, err := c.FormFile("photo")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No file provided"})
	}

	photo, err := h.orderService.UploadPhoto(id, file, c)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(photo)
}

// GET /api/orders/:id/photos
func (h *OrderHandler) GetPhotos(c *fiber.Ctx) error {
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	photos, err := h.orderService.GetPhotos(id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(photos)
}

// Добавить в файл internal/handlers/orders.go

// POST /api/orders/:id/services — сохранить услуги заказа
func (h *OrderHandler) AddServices(c *fiber.Ctx) error {
	orderID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	order, err := h.orderService.GetByID(orderID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
	}
	if role != "admin" && order.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}

	var req models.AddOrderServicesRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if err := h.orderService.AddServices(orderID, req.Services); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"ok": true})
}

// GET /api/orders/:id/services — получить услуги заказа
func (h *OrderHandler) GetServices(c *fiber.Ctx) error {
	orderID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid order ID"})
	}

	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	order, err := h.orderService.GetByID(orderID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Order not found"})
	}
	if role != "admin" && order.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Access denied"})
	}

	services, err := h.orderService.GetServices(orderID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(services)
}

// GET /api/statuses
func (h *OrderHandler) GetStatuses(c *fiber.Ctx) error {
	statuses, err := h.orderService.GetStatuses()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(statuses)
}