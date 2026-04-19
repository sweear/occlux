package secretStorage

import (
	"context"

	"github.com/redis/go-redis/v9"
	"github.com/sweear/occlux/internal/config"
	"github.com/sweear/occlux/internal/logger"
	"github.com/sweear/occlux/internal/model"
)

type redisStorage struct {
	client *redis.Client
}

func NewRedisStorage(cfg *config.Config) *redisStorage {
	client := createRedisClient(cfg)

	if err := client.Ping(context.Background()).Err(); err != nil {
		logger.Fatal("redis ping failed", "error", err)
	}

	return &redisStorage{
		client: client,
	}
}

func createRedisClient(cfg *config.Config) *redis.Client {
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

	return redis.NewClient(opts)
}

func (r *redisStorage) Save(ctx context.Context, secret *model.Secret) error {
	return nil
}

func (r *redisStorage) GetAndDecrement(ctx context.Context, id string) (*model.Secret, error) {
	return &model.Secret{}, nil
}
