package repository

import (
	"errors"

	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/jmoiron/sqlx"
)

type OrderRepository struct {
	db *sqlx.DB
}

func NewOrderRepository(db *sqlx.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// CreateWithSlot создаёт заказ и занимает слот в одной транзакции
func (r *OrderRepository) CreateWithSlot(order *models.Order) error {
	tx, err := r.db.Beginx()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Проверяем слот ещё раз внутри транзакции (FOR UPDATE)
	var isBooked bool
	err = tx.Get(&isBooked, `
		SELECT is_booked FROM time_slots
		WHERE slot_date = $1 AND slot_time = $2
		FOR UPDATE`,
		order.AppointmentDate, order.AppointmentTime,
	)
	if err != nil {
		// Слот не найден в справочнике — создаём «на лету»
	} else if isBooked {
		return errors.New("time slot is already booked")
	}

	// Создаём заказ
	err = tx.QueryRowx(`
		INSERT INTO orders
			(user_id, category_id, custom_device_name, problem_description,
			 final_price, appointment_date, appointment_time, is_custom_device)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at`,
		order.UserID, order.CategoryID, order.CustomDeviceName, order.ProblemDescription,
		order.FinalPrice, order.AppointmentDate, order.AppointmentTime, order.IsCustomDevice,
	).Scan(&order.ID, &order.CreatedAt, &order.UpdatedAt)
	if err != nil {
		return err
	}

	// Помечаем слот как занятый (или создаём если не существует)
	_, err = tx.Exec(`
		INSERT INTO time_slots (slot_date, slot_time, is_booked, order_id)
		VALUES ($1, $2, true, $3)
		ON CONFLICT (slot_date, slot_time) DO UPDATE
		SET is_booked = true, order_id = $3`,
		order.AppointmentDate, order.AppointmentTime, order.ID,
	)
	if err != nil {
		return err
	}

	// Добавляем первый статус «Новая»
	_, err = tx.Exec(`
		INSERT INTO order_status_history (order_id, status_id, changed_by)
		SELECT $1, id, $2 FROM statuses WHERE name = 'Новая'`,
		order.ID, order.UserID,
	)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *OrderRepository) ListAll(statusID int) ([]models.Order, error) {
	query := `
		SELECT o.*,
		       s.name AS status_name, s.color_code,
		       u.first_name || ' ' || u.last_name AS user_name,
		       c.name AS category_name
		FROM orders o
		JOIN users u ON u.id = o.user_id
		LEFT JOIN categories c ON c.id = o.category_id
		LEFT JOIN order_status_history osh ON osh.order_id = o.id
		LEFT JOIN statuses s ON s.id = osh.status_id
		WHERE osh.id = (
			SELECT id FROM order_status_history
			WHERE order_id = o.id ORDER BY changed_at DESC LIMIT 1
		)`

	var args []interface{}
	if statusID > 0 {
		query += ` AND osh.status_id = $1`
		args = append(args, statusID)
	}
	query += ` ORDER BY o.created_at DESC`

	var orders []models.Order
	err := r.db.Select(&orders, query, args...)
	return orders, err
}

func (r *OrderRepository) ListByUser(userID int) ([]models.Order, error) {
	var orders []models.Order
	err := r.db.Select(&orders, `
		SELECT o.*,
		       s.name AS status_name, s.color_code,
		       c.name AS category_name
		FROM orders o
		LEFT JOIN categories c ON c.id = o.category_id
		LEFT JOIN order_status_history osh ON osh.order_id = o.id
		LEFT JOIN statuses s ON s.id = osh.status_id
		WHERE o.user_id = $1
		  AND osh.id = (
			SELECT id FROM order_status_history
			WHERE order_id = o.id ORDER BY changed_at DESC LIMIT 1
		)
		ORDER BY o.created_at DESC`,
		userID,
	)
	return orders, err
}

func (r *OrderRepository) GetByID(id int) (*models.Order, error) {
	order := &models.Order{}
	err := r.db.Get(order, `
		SELECT o.*,
		       s.name AS status_name, s.color_code,
		       u.first_name || ' ' || u.last_name AS user_name,
		       c.name AS category_name
		FROM orders o
		JOIN users u ON u.id = o.user_id
		LEFT JOIN categories c ON c.id = o.category_id
		LEFT JOIN order_status_history osh ON osh.order_id = o.id
		LEFT JOIN statuses s ON s.id = osh.status_id
		WHERE o.id = $1
		  AND osh.id = (
			SELECT id FROM order_status_history
			WHERE order_id = o.id ORDER BY changed_at DESC LIMIT 1
		)`,
		id,
	)
	return order, err
}

func (r *OrderRepository) UpdateStatus(orderID, changedBy, statusID int) error {
	_, err := r.db.Exec(`
		INSERT INTO order_status_history (order_id, status_id, changed_by)
		VALUES ($1, $2, $3)`,
		orderID, statusID, changedBy,
	)
	return err
}

func (r *OrderRepository) GetStatusHistory(orderID int) ([]models.OrderStatusHistory, error) {
	var history []models.OrderStatusHistory
	err := r.db.Select(&history, `
		SELECT osh.*, s.name AS status_name,
		       u.first_name || ' ' || u.last_name AS changed_by_name
		FROM order_status_history osh
		JOIN statuses s ON s.id = osh.status_id
		JOIN users u ON u.id = osh.changed_by
		WHERE osh.order_id = $1
		ORDER BY osh.changed_at ASC`,
		orderID,
	)
	return history, err
}

func (r *OrderRepository) SavePhoto(photo *models.Photo) error {
	return r.db.QueryRowx(`
		INSERT INTO photos (order_id, file_path, file_name)
		VALUES ($1, $2, $3)
		RETURNING id, uploaded_at`,
		photo.OrderID, photo.FilePath, photo.FileName,
	).Scan(&photo.ID, &photo.UploadedAt)
}

func (r *OrderRepository) GetPhotos(orderID int) ([]models.Photo, error) {
	var photos []models.Photo
	err := r.db.Select(&photos, `SELECT * FROM photos WHERE order_id = $1`, orderID)
	return photos, err
}
