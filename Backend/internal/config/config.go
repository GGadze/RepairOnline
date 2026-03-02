package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort    string
	AppEnv     string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string
	JWTSecret  string
	JWTExpires string
	UploadDir  string
	MaxFileSize int64
}

func Load() *Config {
	_ = godotenv.Load()

	maxSize, _ := strconv.ParseInt(getEnv("MAX_FILE_SIZE", "10485760"), 10, 64)

	return &Config{
		AppPort:     getEnv("APP_PORT", "3000"),
		AppEnv:      getEnv("APP_ENV", "development"),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5433"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  getEnv("DB_PASSWORD", "Admin123"),
		DBName:      getEnv("DB_NAME", "remont_online"),
		DBSSLMode:   getEnv("DB_SSLMODE", "disable"),
		JWTSecret:   getEnv("JWT_SECRET", "secret"),
		JWTExpires:  getEnv("JWT_EXPIRES_IN", "24h"),
		UploadDir:   getEnv("UPLOAD_DIR", "./uploads"),
		MaxFileSize: maxSize,
	}
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
