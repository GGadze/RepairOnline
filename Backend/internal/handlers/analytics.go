package handlers

import (
	"github.com/GGadze/RepairOnline/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type AnalyticsHandler struct {
	analyticsRepo *repository.AnalyticsRepository
}

func NewAnalyticsHandler(analyticsRepo *repository.AnalyticsRepository) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsRepo: analyticsRepo}
}

// GET /api/admin/stats — общая статистика
func (h *AnalyticsHandler) GetStats(c *fiber.Ctx) error {
	stats, err := h.analyticsRepo.GetAdminStats()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(stats)
}

// GET /api/admin/stats/monthly — прибыль по месяцам
func (h *AnalyticsHandler) GetMonthlyRevenue(c *fiber.Ctx) error {
	data, err := h.analyticsRepo.GetMonthlyRevenue()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}

// GET /api/admin/stats/users — прибыль по пользователям
func (h *AnalyticsHandler) GetUserRevenue(c *fiber.Ctx) error {
	data, err := h.analyticsRepo.GetRevenueByUser()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}