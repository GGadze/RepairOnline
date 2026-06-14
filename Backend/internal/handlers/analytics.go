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

// GET /api/admin/stats?from=YYYY-MM-DD&to=YYYY-MM-DD — общая статистика за период
func (h *AnalyticsHandler) GetStats(c *fiber.Ctx) error {
	from := c.Query("from")
	to := c.Query("to")
	stats, err := h.analyticsRepo.GetAdminStats(from, to)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(stats)
}

// GET /api/admin/stats/monthly?from=&to= — прибыль по месяцам
func (h *AnalyticsHandler) GetMonthlyRevenue(c *fiber.Ctx) error {
	from := c.Query("from")
	to := c.Query("to")
	data, err := h.analyticsRepo.GetMonthlyRevenue(from, to)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}

// GET /api/admin/stats/users?from=&to= — прибыль по пользователям
func (h *AnalyticsHandler) GetUserRevenue(c *fiber.Ctx) error {
	from := c.Query("from")
	to := c.Query("to")
	data, err := h.analyticsRepo.GetRevenueByUser(from, to)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(data)
}