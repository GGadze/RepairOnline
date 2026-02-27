package repository

import (
	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/jmoiron/sqlx"
)

// ---- CategoryRepository ----

type CategoryRepository struct {
	db *sqlx.DB
}

func NewCategoryRepository(db *sqlx.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// GetTree возвращает плоский список, фронтенд строит дерево сам,
// либо используем рекурсию ниже
func (r *CategoryRepository) GetTree() ([]models.Category, error) {
	var all []models.Category
	err := r.db.Select(&all, `SELECT * FROM categories ORDER BY level, parent_id, name`)
	if err != nil {
		return nil, err
	}
	return buildTree(all, nil), nil
}

func buildTree(all []models.Category, parentID *int) []models.Category {
	var result []models.Category
	for _, cat := range all {
		if (parentID == nil && cat.ParentID == nil) ||
			(parentID != nil && cat.ParentID != nil && *cat.ParentID == *parentID) {
			cat.Children = buildTree(all, &cat.ID)
			result = append(result, cat)
		}
	}
	return result
}

func (r *CategoryRepository) GetByID(id int) (*models.Category, error) {
	cat := &models.Category{}
	err := r.db.Get(cat, `SELECT * FROM categories WHERE id = $1`, id)
	return cat, err
}

func (r *CategoryRepository) Create(cat *models.Category) error {
	return r.db.QueryRowx(`
		INSERT INTO categories (name, parent_id, level, base_price)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at`,
		cat.Name, cat.ParentID, cat.Level, cat.BasePrice,
	).Scan(&cat.ID, &cat.CreatedAt, &cat.UpdatedAt)
}

func (r *CategoryRepository) Update(cat *models.Category) error {
	_, err := r.db.Exec(`
		UPDATE categories SET name=$1, parent_id=$2, level=$3, base_price=$4, updated_at=NOW()
		WHERE id=$5`,
		cat.Name, cat.ParentID, cat.Level, cat.BasePrice, cat.ID,
	)
	return err
}

func (r *CategoryRepository) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM categories WHERE id = $1`, id)
	return err
}

// ---- SlotRepository ----

type SlotRepository struct {
	db *sqlx.DB
}

func NewSlotRepository(db *sqlx.DB) *SlotRepository {
	return &SlotRepository{db: db}
}

func (r *SlotRepository) IsSlotFree(date, time string) (bool, error) {
	var count int
	err := r.db.Get(&count, `
		SELECT COUNT(*) FROM time_slots
		WHERE slot_date = $1 AND slot_time = $2 AND is_booked = true`,
		date, time,
	)
	return count == 0, err
}

func (r *SlotRepository) GetFreeByDate(date string) ([]models.TimeSlot, error) {
	var slots []models.TimeSlot
	err := r.db.Select(&slots, `
		SELECT * FROM time_slots
		WHERE slot_date = $1 AND is_booked = false
		ORDER BY slot_time`,
		date,
	)
	return slots, err
}

func (r *SlotRepository) Create(slot *models.TimeSlot) error {
	return r.db.QueryRowx(`
		INSERT INTO time_slots (slot_date, slot_time, is_booked)
		VALUES ($1, $2, $3)
		RETURNING id, created_at`,
		slot.SlotDate, slot.SlotTime, slot.IsBooked,
	).Scan(&slot.ID, &slot.CreatedAt)
}

func (r *SlotRepository) Delete(id int) error {
	_, err := r.db.Exec(`DELETE FROM time_slots WHERE id = $1 AND is_booked = false`, id)
	return err
}

// ---- ReviewRepository ----

type ReviewRepository struct {
	db *sqlx.DB
}

func NewReviewRepository(db *sqlx.DB) *ReviewRepository {
	return &ReviewRepository{db: db}
}

func (r *ReviewRepository) Create(review *models.Review) error {
	return r.db.QueryRowx(`
		INSERT INTO reviews (order_id, user_id, rating, comment)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at`,
		review.OrderID, review.UserID, review.Rating, review.Comment,
	).Scan(&review.ID, &review.CreatedAt)
}

func (r *ReviewRepository) FindByOrderID(orderID int) (*models.Review, error) {
	review := &models.Review{}
	err := r.db.Get(review, `SELECT * FROM reviews WHERE order_id = $1`, orderID)
	if err != nil {
		return nil, err
	}
	return review, nil
}

func (r *ReviewRepository) ListAll() ([]models.Review, error) {
	var reviews []models.Review
	err := r.db.Select(&reviews, `
		SELECT r.*, u.first_name || ' ' || u.last_name AS user_name
		FROM reviews r
		JOIN users u ON u.id = r.user_id
		ORDER BY r.created_at DESC`,
	)
	return reviews, err
}

func (r *ReviewRepository) GetAvgRating() (float64, error) {
	var avg float64
	err := r.db.Get(&avg, `SELECT COALESCE(AVG(rating), 0) FROM reviews`)
	return avg, err
}
