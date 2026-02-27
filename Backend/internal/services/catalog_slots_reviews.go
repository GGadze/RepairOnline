package services

import (
	"errors"

	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/GGadze/RepairOnline/internal/repository"
)

// ---- CategoryService ----

type CategoryService struct {
	categoryRepo *repository.CategoryRepository
}

func NewCategoryService(categoryRepo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{categoryRepo: categoryRepo}
}

func (s *CategoryService) GetTree() ([]models.Category, error) {
	return s.categoryRepo.GetTree()
}

func (s *CategoryService) GetByID(id int) (*models.Category, error) {
	return s.categoryRepo.GetByID(id)
}

func (s *CategoryService) Create(req *models.CreateCategoryRequest) (*models.Category, error) {
	cat := &models.Category{
		Name:      req.Name,
		ParentID:  req.ParentID,
		Level:     req.Level,
		BasePrice: req.BasePrice,
	}
	if err := s.categoryRepo.Create(cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (s *CategoryService) Update(id int, req *models.CreateCategoryRequest) (*models.Category, error) {
	cat, err := s.categoryRepo.GetByID(id)
	if err != nil {
		return nil, errors.New("category not found")
	}
	cat.Name = req.Name
	cat.ParentID = req.ParentID
	cat.Level = req.Level
	cat.BasePrice = req.BasePrice

	if err := s.categoryRepo.Update(cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (s *CategoryService) Delete(id int) error {
	return s.categoryRepo.Delete(id)
}

// ---- SlotService ----

type SlotService struct {
	slotRepo *repository.SlotRepository
}

func NewSlotService(slotRepo *repository.SlotRepository) *SlotService {
	return &SlotService{slotRepo: slotRepo}
}

func (s *SlotService) GetFreeByDate(date string) ([]models.TimeSlot, error) {
	return s.slotRepo.GetFreeByDate(date)
}

func (s *SlotService) Create(req *models.CreateSlotRequest) (*models.TimeSlot, error) {
	slot := &models.TimeSlot{
		SlotDate: req.SlotDate,
		SlotTime: req.SlotTime,
		IsBooked: false,
	}
	if err := s.slotRepo.Create(slot); err != nil {
		return nil, err
	}
	return slot, nil
}

func (s *SlotService) Delete(id int) error {
	return s.slotRepo.Delete(id)
}

// ---- ReviewService ----

type ReviewService struct {
	reviewRepo *repository.ReviewRepository
	orderRepo  *repository.OrderRepository
}

func NewReviewService(reviewRepo *repository.ReviewRepository, orderRepo *repository.OrderRepository) *ReviewService {
	return &ReviewService{reviewRepo: reviewRepo, orderRepo: orderRepo}
}

func (s *ReviewService) Create(orderID, userID int, req *models.CreateReviewRequest) (*models.Review, error) {
	// Проверяем, что заказ принадлежит этому клиенту
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil || order.UserID != userID {
		return nil, errors.New("order not found or access denied")
	}

	// Проверяем, что отзыв ещё не оставлен
	existing, _ := s.reviewRepo.FindByOrderID(orderID)
	if existing != nil {
		return nil, errors.New("review already exists for this order")
	}

	review := &models.Review{
		OrderID: orderID,
		UserID:  userID,
		Rating:  req.Rating,
		Comment: req.Comment,
	}

	if err := s.reviewRepo.Create(review); err != nil {
		return nil, err
	}
	return review, nil
}

func (s *ReviewService) ListPublic() ([]models.Review, float64, error) {
	reviews, err := s.reviewRepo.ListAll()
	if err != nil {
		return nil, 0, err
	}

	avgRating, err := s.reviewRepo.GetAvgRating()
	if err != nil {
		avgRating = 0
	}

	return reviews, avgRating, nil
}
