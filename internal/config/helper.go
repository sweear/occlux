package config

import (
	"os"
	"strconv"
	"time"

	"github.com/sweear/occlux/internal/logger"
)

func mustGet(key string) string {
	value := os.Getenv(key)
	if value == "" {
		logger.Fatal("env is required", "key", key)
	}
	return value
}

func parseDuration(key string) time.Duration {
	value := os.Getenv(key)
	if value == "" {
		logger.Warn("environment variable not set, using default", "key", key, "default", 0)
		return 0
	}

	time, err := time.ParseDuration(value)
	if err != nil {
		logger.Warn("failed to parse duration", "key", key, "value", value, "error", err)
		return 0
	}

	return time
}

func parseInt(key string) int {
	value := os.Getenv(key)
	if value == "" {
		logger.Warn("environment variable not set, using default", "key", key, "default", 0)
		return 0
	}

	num, err := strconv.Atoi(value)
	if err != nil {
		logger.Warn("failed to parse integer", "key", key, "value", value, "error", err)
		return 0
	}

	return num
}
