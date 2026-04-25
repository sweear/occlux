package redis

import (
	"context"

	"github.com/redis/go-redis/v9"
	"github.com/sweear/occlux/internal/config"
	"github.com/sweear/occlux/internal/logger"
)

func NewRedisClient(cfg *config.Config, db int) *redis.Client {
	opts, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		logger.Fatal("redis parse url error", "error", err)
	}

	opts.PoolSize = cfg.RedisPoolSize
	opts.MinIdleConns = cfg.RedisMinIdleConns
	opts.DialTimeout = cfg.RedisDialTimeout
	opts.ReadTimeout = cfg.RedisReadTimeout
	opts.WriteTimeout = cfg.RedisWriteTimeout
	opts.PoolTimeout = cfg.RedisPoolTimeout
	opts.MaxRetries = cfg.RedisMaxRetries
	opts.Protocol = cfg.RedisProtocol

	opts.DB = db

	client := redis.NewClient(opts)

	if err := client.Ping(context.Background()).Err(); err != nil {
		logger.Fatal("redis ping failed", "error", err)
	}

	return client
}
