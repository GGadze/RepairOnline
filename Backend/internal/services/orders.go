package services

import (
	"errors"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"time"

	"github.com/GGadze/RepairOnline/internal/models"
	"github.com/GGadze/RepairOnline/internal/repository"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type OrderService struct {
	orderRepo    *repository.OrderRepository
	slotRepo     *repository.SlotRepository
	categoryRepo *repository.CategoryRepository
	uploadDir    string
}

func NewOrderService(
	orderRepo *repository.OrderRepository,
	slotRepo *repository.SlotRepository,
	categoryRepo *repository.CategoryRepository,
	uploadDir string,
) *OrderService {
	return &OrderService{
		orderRepo:    orderRepo,
		slotRepo:     slotRepo,
		categoryRepo: categoryRepo,
		uploadDir:    uploadDir,
	}
}

func (s *OrderService) Create(userID int, req *models.CreateOrderRequest) (*models.Order, error) {
	// Проверяем, что слот свободен (транзакционно)
	slotFree, err := s.slotRepo.IsSlotFree(req.AppointmentDate, req.AppointmentTime)
	if err != nil {
		return nil, err
	}
	if !slotFree {
		return nil, errors.New("this time slot is already booked")
	}

	// Рассчитываем предварительную стоимость
	var finalPrice *float64
	if req.CategoryID != nil && !req.IsCustomDevice {
		cat, err := s.categoryRepo.GetByID(*req.CategoryID)
		if err == nil {
			price := cat.BasePrice
			finalPrice = &price
		}
	}

	order := &models.Order{
		UserID:             userID,
		CategoryID:         req.CategoryID,
		CustomDeviceName:   req.CustomDeviceName,
		ProblemDescription: req.ProblemDescription,
		FinalPrice:         finalPrice,
		AppointmentDate:    req.AppointmentDate,
		AppointmentTime:    req.AppointmentTime,
		IsCustomDevice:     req.IsCustomDevice,
	}

	// Создаём заказ и блокируем слот в одной транзакции
	if err := s.orderRepo.CreateWithSlot(order); err != nil {
		return nil, err
	}

	return order, nil
}

func (s *OrderService) ListAll(statusID int) ([]models.Order, error) {
	return s.orderRepo.ListAll(statusID)
}

func (s *OrderService) ListByUser(userID int) ([]models.Order, error) {
	return s.orderRepo.ListByUser(userID)
}

func (s *OrderService) GetByID(id int) (*models.Order, error) {
	return s.orderRepo.GetByID(id)
}

func (s *OrderService) UpdateStatus(orderID, adminID int, req *models.UpdateOrderStatusRequest) error {
	// Проверяем, что заказ существует
	_, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return errors.New("order not found")
	}

	return s.orderRepo.UpdateStatus(orderID, adminID, req.StatusID)
}

func (s *OrderService) GetStatusHistory(orderID int) ([]models.OrderStatusHistory, error) {
	return s.orderRepo.GetStatusHistory(orderID)
}

func (s *OrderService) UploadPhoto(orderID int, file *multipart.FileHeader, c *fiber.Ctx) (*models.Photo, error) {
	// Генерируем уникальное имя файла
	ext := filepath.Ext(file.Filename)
	uniqueName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	savePath := filepath.Join(s.uploadDir, uniqueName)

	if err := c.SaveFile(file, savePath); err != nil {
		return nil, errors.New("failed to save file")
	}

	photo := &models.Photo{
		OrderID:    orderID,
		FilePath:   savePath,
		FileName:   file.Filename,
		UploadedAt: time.Now(),
	}

	if err := s.orderRepo.SavePhoto(photo); err != nil {
		return nil, err
	}

	return photo, nil
}

func (s *OrderService) GetPhotos(orderID int) ([]models.Photo, error) {
	return s.orderRepo.GetPhotos(orderID)
}
