package handlers

import (
	"strconv"

	"github.com/GGadze/RepairOnline/internal/middleware"
	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/GGadze/RepairOnline/internal/repository"
	"github.com/gofiber/fiber/v2"
)

type ChatHandler struct {
	chatRepo *repository.ChatRepository
}

func NewChatHandler(chatRepo *repository.ChatRepository) *ChatHandler {
	return &ChatHandler{chatRepo: chatRepo}
}

// GET /api/chat — клиент получает свой диалог + сообщения
func (h *ChatHandler) GetMyConversation(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	conv, err := h.chatRepo.GetOrCreateConversation(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	msgs, err := h.chatRepo.GetMessages(conv.ID, 100, 0)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	// Помечаем сообщения от админа как прочитанные
	_ = h.chatRepo.MarkRead(conv.ID, false)

	return c.JSON(fiber.Map{
		"conversation": conv,
		"messages":     msgs,
	})
}

// POST /api/chat/message — клиент отправляет сообщение
func (h *ChatHandler) SendMessage(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	var req models.SendMessageRequest
	if err := c.BodyParser(&req); err != nil || req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Сообщение не может быть пустым"})
	}

	var convID int
	isAdmin := role == "admin"

	if isAdmin {
		// Админ указывает conversation_id
		cid, err := strconv.Atoi(c.Query("conversation_id"))
		if err != nil || cid == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "conversation_id required for admin"})
		}
		convID = cid
	} else {
		conv, err := h.chatRepo.GetOrCreateConversation(userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		convID = conv.ID
	}

	msg, err := h.chatRepo.SendMessage(convID, userID, isAdmin, req.Message)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.Status(fiber.StatusCreated).JSON(msg)
}

// GET /api/chat/messages — получить сообщения (polling, для клиента и админа)
func (h *ChatHandler) GetMessages(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	role := middleware.GetRole(c)

	var convID int

	if role == "admin" {
		cid, err := strconv.Atoi(c.Query("conversation_id"))
		if err != nil || cid == 0 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "conversation_id required"})
		}
		convID = cid
		// Помечаем сообщения от клиента как прочитанные
		_ = h.chatRepo.MarkRead(convID, true)
	} else {
		conv, err := h.chatRepo.GetOrCreateConversation(userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}
		convID = conv.ID
		_ = h.chatRepo.MarkRead(convID, false)
	}

	msgs, err := h.chatRepo.GetMessages(convID, 100, 0)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(msgs)
}

// GET /api/admin/chat/conversations — список всех диалогов (только для админа)
func (h *ChatHandler) ListConversations(c *fiber.Ctx) error {
	convs, err := h.chatRepo.ListConversations()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(convs)
}