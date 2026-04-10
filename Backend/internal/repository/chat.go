package repository

import (
	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/jmoiron/sqlx"
)

type ChatRepository struct {
	db *sqlx.DB
}

func NewChatRepository(db *sqlx.DB) *ChatRepository {
	return &ChatRepository{db: db}
}

// GetOrCreateConversation — получить или создать диалог для пользователя
func (r *ChatRepository) GetOrCreateConversation(userID int) (*models.ChatConversation, error) {
	conv := &models.ChatConversation{}
	err := r.db.Get(conv, `SELECT id, user_id, created_at, updated_at FROM chat_conversations WHERE user_id = $1`, userID)
	if err != nil {
		// Создаём новый
		err = r.db.QueryRow(
			`INSERT INTO chat_conversations (user_id) VALUES ($1) RETURNING id, user_id, created_at, updated_at`,
			userID,
		).Scan(&conv.ID, &conv.UserID, &conv.CreatedAt, &conv.UpdatedAt)
		if err != nil {
			return nil, err
		}
	}
	return conv, nil
}

// GetMessages — получить сообщения диалога
func (r *ChatRepository) GetMessages(conversationID int, limit, offset int) ([]models.ChatMessage, error) {
	var msgs []models.ChatMessage
	err := r.db.Select(&msgs, `
		SELECT
			cm.id, cm.conversation_id, cm.sender_id, cm.is_from_admin,
			cm.message, cm.is_read, cm.created_at,
			(u.first_name || ' ' || u.last_name) AS sender_name
		FROM chat_messages cm
		JOIN users u ON u.id = cm.sender_id
		WHERE cm.conversation_id = $1
		ORDER BY cm.created_at ASC
		LIMIT $2 OFFSET $3
	`, conversationID, limit, offset)
	return msgs, err
}

// SendMessage — отправить сообщение
func (r *ChatRepository) SendMessage(convID, senderID int, isFromAdmin bool, message string) (*models.ChatMessage, error) {
	msg := &models.ChatMessage{}
	err := r.db.QueryRow(`
		INSERT INTO chat_messages (conversation_id, sender_id, is_from_admin, message)
		VALUES ($1, $2, $3, $4)
		RETURNING id, conversation_id, sender_id, is_from_admin, message, is_read, created_at
	`, convID, senderID, isFromAdmin, message).Scan(
		&msg.ID, &msg.ConversationID, &msg.SenderID, &msg.IsFromAdmin,
		&msg.Message, &msg.IsRead, &msg.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	// Обновляем updated_at диалога
	r.db.Exec(`UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1`, convID)
	return msg, nil
}

// MarkRead — пометить сообщения как прочитанные
func (r *ChatRepository) MarkRead(conversationID int, isAdmin bool) error {
	// Если читает админ — помечаем сообщения от клиента
	// Если читает клиент — помечаем сообщения от админа
	_, err := r.db.Exec(`
		UPDATE chat_messages
		SET is_read = TRUE
		WHERE conversation_id = $1 AND is_from_admin = $2 AND is_read = FALSE
	`, conversationID, !isAdmin)
	return err
}

// ListConversations — список всех диалогов (для админа)
func (r *ChatRepository) ListConversations() ([]models.ChatConversation, error) {
	var convs []models.ChatConversation
	err := r.db.Select(&convs, `
		SELECT
			cc.id, cc.user_id, cc.created_at, cc.updated_at,
			(u.first_name || ' ' || u.last_name) AS user_name,
			(SELECT message FROM chat_messages WHERE conversation_id = cc.id ORDER BY created_at DESC LIMIT 1) AS last_message,
			(SELECT COUNT(*) FROM chat_messages WHERE conversation_id = cc.id AND is_read = FALSE AND is_from_admin = FALSE) AS unread_count
		FROM chat_conversations cc
		JOIN users u ON u.id = cc.user_id
		ORDER BY cc.updated_at DESC
	`)
	return convs, err
}

// GetConversationByID — получить диалог по ID
func (r *ChatRepository) GetConversationByID(convID int) (*models.ChatConversation, error) {
	conv := &models.ChatConversation{}
	err := r.db.Get(conv, `
		SELECT cc.id, cc.user_id, cc.created_at, cc.updated_at,
			(u.first_name || ' ' || u.last_name) AS user_name,
			0 AS unread_count
		FROM chat_conversations cc
		JOIN users u ON u.id = cc.user_id
		WHERE cc.id = $1
	`, convID)
	return conv, err
}