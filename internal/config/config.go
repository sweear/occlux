package config

import (
	"time"

	"github.com/joho/godotenv"
	"github.com/sweear/occlux/internal/logger"
)

type Config struct {
	Host              string
	Port              string
	ReadTimeout       time.Duration
	ReadHeaderTimeout time.Duration
	WriteTimeout      time.Duration
	IdleTimeout       time.Duration
	MaxHeaderBytes    int
}

func Load() *Config {

	err := godotenv.Load()
	if err != nil {
		logger.Warn("no .env file found, using system environment")
	}

	hostServer := mustGet("OCCLUX_HOST")
	portServer := mustGet("OCCLUX_PORT")
	readTimeout := parseDuration("OCCLUX_READ_TIMEOUT")
	readHeaderTimeout := parseDuration("OCCLUX_READ_HEADER_TIMEOUT")
	writeTimeout := parseDuration("OCCLUX_WRITE_TIMEOUT")
	idleTimeout := parseDuration("OCCLUX_IDLE_TIMEOUT")
	maxHeaderBytes := parseInt("OCCLUX_MAX_HEADER_BYTES")

	return &Config{
		Host:              hostServer,
		Port:              portServer,
		ReadTimeout:       readTimeout,
		ReadHeaderTimeout: readHeaderTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
		MaxHeaderBytes:    maxHeaderBytes,
	}
}
