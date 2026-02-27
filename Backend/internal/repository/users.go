package repository

import (
	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/jmoiron/sqlx"
)

type UserRepository struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	query := `
		INSERT INTO users (email, password_hash, first_name, last_name, phone)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at`
	return r.db.QueryRowx(query,
		user.Email, user.PasswordHash, user.FirstName, user.LastName, user.Phone,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	user := &models.User{}
	err := r.db.Get(user, `SELECT * FROM users WHERE email = $1`, email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) FindByID(id int) (*models.User, error) {
	user := &models.User{}
	err := r.db.Get(user, `SELECT * FROM users WHERE id = $1`, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *UserRepository) AssignRole(userID int, roleName string) error {
	_, err := r.db.Exec(`
		INSERT INTO user_roles (user_id, role_id)
		SELECT $1, id FROM roles WHERE name = $2
		ON CONFLICT DO NOTHING`,
		userID, roleName,
	)
	return err
}

func (r *UserRepository) GetPrimaryRole(userID int) (string, error) {
	var roleName string
	err := r.db.Get(&roleName, `
		SELECT r.name FROM roles r
		JOIN user_roles ur ON ur.role_id = r.id
		WHERE ur.user_id = $1
		ORDER BY r.id DESC
		LIMIT 1`,
		userID,
	)
	return roleName, err
}
