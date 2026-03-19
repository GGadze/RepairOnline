package main

import (
	"log"
	"path/filepath"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/GGadze/RepairOnline/internal/config"
	"github.com/GGadze/RepairOnline/internal/database"
	"github.com/GGadze/RepairOnline/internal/handlers"
	"github.com/GGadze/RepairOnline/internal/middleware"
	"github.com/GGadze/RepairOnline/internal/repository"
	"github.com/GGadze/RepairOnline/internal/services"
)

func main() {
	// Config
	cfg := config.Load()

	// DB
	db := database.Connect(cfg)
	defer db.Close()

	// ── Миграции ──────────────────────────────────────
	migrationsDir := filepath.Join(".", "migrations")
	log.Println("Running migrations...")
	if err := database.RunMigrations(db, migrationsDir); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Migrations done.")
	// ──────────────────────────────────────────────────

	// Repositories
	userRepo := repository.NewUserRepository(db)
	orderRepo := repository.NewOrderRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	slotRepo := repository.NewSlotRepository(db)
	reviewRepo := repository.NewReviewRepository(db)

	// Services
	jwtExpires, _ := time.ParseDuration(cfg.JWTExpires)
	authService := services.NewAuthService(userRepo, cfg.JWTSecret, jwtExpires)
	orderService := services.NewOrderService(orderRepo, slotRepo, categoryRepo, cfg.UploadDir)
	categoryService := services.NewCategoryService(categoryRepo)
	slotService := services.NewSlotService(slotRepo)
	reviewService := services.NewReviewService(reviewRepo, orderRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	orderHandler := handlers.NewOrderHandler(orderService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	slotHandler := handlers.NewSlotHandler(slotService)
	reviewHandler := handlers.NewReviewHandler(reviewService)

	// Fiber app
	app := fiber.New(fiber.Config{
		AppName:   "Ремонт-Онлайн API",
		BodyLimit: int(cfg.MaxFileSize),
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	}))

	app.Static("/uploads", cfg.UploadDir)

	api := app.Group("/api")

	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)

	api.Get("/categories", categoryHandler.List)
	api.Get("/categories/:id", categoryHandler.Get)
	api.Get("/reviews", reviewHandler.List)
	api.Get("/slots", slotHandler.ListFree)

	protected := api.Group("", middleware.Protected(cfg.JWTSecret))
	protected.Get("/auth/me", authHandler.Me)
	protected.Put("/auth/avatar", authHandler.UpdateAvatar)
	protected.Put("/auth/profile", authHandler.UpdateProfile)
	protected.Put("/auth/password", authHandler.ChangePassword)
	api.Post("/auth/reset-password", authHandler.RequestPasswordReset)
	protected.Post("/orders", orderHandler.Create)
	protected.Get("/orders", orderHandler.List)
	protected.Get("/orders/:id", orderHandler.Get)
	protected.Get("/orders/:id/history", orderHandler.GetHistory)
	protected.Post("/orders/:id/photos", orderHandler.UploadPhoto)
	protected.Get("/orders/:id/photos", orderHandler.GetPhotos)
	protected.Post("/orders/:id/reviews", reviewHandler.Create)

	admin := api.Group("/admin",
		middleware.Protected(cfg.JWTSecret),
		middleware.AdminOnly(),
	)
	admin.Patch("/orders/:id/status", orderHandler.UpdateStatus)
	admin.Post("/categories", categoryHandler.Create)
	admin.Put("/categories/:id", categoryHandler.Update)
	admin.Delete("/categories/:id", categoryHandler.Delete)
	admin.Post("/slots", slotHandler.Create)
	admin.Delete("/slots/:id", slotHandler.Delete)

	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Route not found"})
	})

	log.Printf("🚀 Server starting on port %s", cfg.AppPort)
	log.Fatal(app.Listen(":" + cfg.AppPort))
}