package config

import (
	"github.com/joho/godotenv"
	"github.com/sweear/occlux/internal/logger"
)

type Config struct {
	Host string
	Port string
}

func Load() *Config {

	err := godotenv.Load()
	if err != nil {
		logger.Warn("no .env file found, using system environment")
	}

	hostServer := mustGet("HOST")
	portServer := mustGet("PORT")

	logger.Info("config loaded successfully")
	return &Config{
		Host: hostServer,
		Port: portServer,
	}
}
