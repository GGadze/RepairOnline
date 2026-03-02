package services

import (
	"errors"
	"time"

	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/GGadze/RepairOnline/internal/repository"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	userRepo   *repository.UserRepository
	jwtSecret  string
	jwtExpires time.Duration
}

func NewAuthService(userRepo *repository.UserRepository, jwtSecret string, jwtExpires time.Duration) *AuthService {
	return &AuthService{
		userRepo:   userRepo,
		jwtSecret:  jwtSecret,
		jwtExpires: jwtExpires,
	}
}

func (s *AuthService) Register(req *models.RegisterRequest) (*models.AuthResponse, error) {
	existing, _ := s.userRepo.FindByEmail(req.Email)
	if existing != nil {
		return nil, errors.New("email already registered")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Email:        req.Email,
		PasswordHash: string(hash),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Phone:        req.Phone,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, errors.New("failed to create user")
	}

	if err := s.userRepo.AssignRole(user.ID, "client"); err != nil {
		return nil, errors.New("failed to assign role")
	}

	token, err := s.generateToken(user, "client")
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{Token: token, User: *user}, nil
}

func (s *AuthService) Login(req *models.LoginRequest) (*models.AuthResponse, error) {
	user, err := s.userRepo.FindByEmail(req.Email)
	if err != nil || user == nil {
		return nil, errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, errors.New("invalid email or password")
	}

	role, err := s.userRepo.GetPrimaryRole(user.ID)
	if err != nil {
		role = "client"
	}

	token, err := s.generateToken(user, role)
	if err != nil {
		return nil, err
	}

	return &models.AuthResponse{Token: token, User: *user}, nil
}

func (s *AuthService) GetUserByID(id int) (*models.User, error) {
	return s.userRepo.FindByID(id)
}

func (s *AuthService) UpdateAvatar(userID, avatarID int) error {
	return s.userRepo.UpdateAvatar(userID, avatarID)
}

func (s *AuthService) generateToken(user *models.User, role string) (string, error) {
	// Минимум 7 дней, если jwtExpires меньше
	expires := s.jwtExpires
	if expires < 7*24*time.Hour {
		expires = 7 * 24 * time.Hour
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"role":    role,
		"exp":     time.Now().Add(expires).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}