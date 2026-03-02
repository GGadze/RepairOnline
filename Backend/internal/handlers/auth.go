package handlers

import (
	"github.com/GGadze/RepairOnline/internal/middleware"
	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/GGadze/RepairOnline/internal/services"
	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// POST /api/auth/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	resp, err := h.authService.Register(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(resp)
}

// POST /api/auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	resp, err := h.authService.Login(&req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(resp)
}

// GET /api/auth/me
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(int)

	user, err := h.authService.GetUserByID(userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(user)
}

// PUT /api/auth/avatar
func (h *AuthHandler) UpdateAvatar(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req models.UpdateAvatarRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.AvatarID < 1 || req.AvatarID > 10 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "avatar_id must be between 1 and 10"})
	}

	if err := h.authService.UpdateAvatar(userID, req.AvatarID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"avatar_id": req.AvatarID})
}