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

	RedisURL          string
	RedisPoolSize     int
	RedisMinIdleConns int
	RedisDialTimeout  time.Duration
	RedisReadTimeout  time.Duration
	RedisWriteTimeout time.Duration
	RedisPoolTimeout  time.Duration
	RedisMaxRetries   int
	RedisProtocol     int

	RedisSecretDB  int
	RedisLimiterDB int

	RateLimitSecretCreate string
	RateLimitSecretGet    string
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

	redisURL := mustGet("OCCLUX_REDIS_URL")
	redisPoolSize := parseInt("OCCLUX_REDIS_POOL_SIZE")
	redisMinIdleConns := parseInt("OCCLUX_REDIS_MIN_IDLE_CONNS")
	redisDialTimeout := parseDuration("OCCLUX_REDIS_DIAL_TIMEOUT")
	redisReadTimeout := parseDuration("OCCLUX_REDIS_READ_TIMEOUT")
	redisWriteTimeout := parseDuration("OCCLUX_REDIS_WRITE_TIMEOUT")
	redisPoolTimeout := parseDuration("OCCLUX_REDIS_POOL_TIMEOUT")
	redisMaxRetries := parseInt("OCCLUX_REDIS_MAX_RETRIES")
	redisProtocol := parseInt("OCCLUX_REDIS_PROTOCOL")

	redisSecretDB := parseInt("OCCLUX_REDIS_SECRET_DB")
	redisLimiterDB := parseInt("OCCLUX_REDIS_LIMITER_DB")

	rateLimitSecretCreate := mustGet("OCCLUX_RATE_LIMIT_SECRET_CREATE")
	rateLimitSecretGet := mustGet("OCCLUX_RATE_LIMIT_SECRET_GET")

	return &Config{
		Host:              hostServer,
		Port:              portServer,
		ReadTimeout:       readTimeout,
		ReadHeaderTimeout: readHeaderTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
		MaxHeaderBytes:    maxHeaderBytes,

		RedisURL:          redisURL,
		RedisPoolSize:     redisPoolSize,
		RedisMinIdleConns: redisMinIdleConns,
		RedisDialTimeout:  redisDialTimeout,
		RedisReadTimeout:  redisReadTimeout,
		RedisWriteTimeout: redisWriteTimeout,
		RedisPoolTimeout:  redisPoolTimeout,
		RedisMaxRetries:   redisMaxRetries,
		RedisProtocol:     redisProtocol,

		RedisSecretDB:  redisSecretDB,
		RedisLimiterDB: redisLimiterDB,

		RateLimitSecretCreate: rateLimitSecretCreate,
		RateLimitSecretGet:    rateLimitSecretGet,
	}
}
