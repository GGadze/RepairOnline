package handlers

import (
	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/GGadze/RepairOnline/internal/services"
	"github.com/gofiber/fiber/v2"
)

type SlotHandler struct {
	slotService *services.SlotService
}

func NewSlotHandler(slotService *services.SlotService) *SlotHandler {
	return &SlotHandler{slotService: slotService}
}

// GET /api/slots?date=2026-03-01 — свободные слоты на дату
func (h *SlotHandler) ListFree(c *fiber.Ctx) error {
	date := c.Query("date")
	if date == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "date query param required"})
	}

	slots, err := h.slotService.GetFreeByDate(date)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(slots)
}

// POST /api/admin/slots — создать слот (или несколько)
func (h *SlotHandler) Create(c *fiber.Ctx) error {
	var req models.CreateSlotRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request body"})
	}

	slot, err := h.slotService.Create(&req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(slot)
}

// DELETE /api/admin/slots/:id
func (h *SlotHandler) Delete(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid ID"})
	}

	if err := h.slotService.Delete(id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Slot deleted"})
}
