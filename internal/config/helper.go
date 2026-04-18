package config

import (
	"os"

	"github.com/sweear/occlux/internal/logger"
)

func mustGet(key string) string {
	value := os.Getenv(key)
	if key == "" {
		logger.Fatal("env is required", "key", key)
	}
	return value
}
