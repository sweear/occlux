package secretStorage

import (
	"context"

	"github.com/sweear/occlux/internal/model"
)

type redisStorage struct {
}

func NewRedisStorage() *redisStorage {
	return &redisStorage{}
}

func (r *redisStorage) Save(ctx context.Context, secret *model.Secret) error {
	return nil
}

func (r *redisStorage) GetAndDecrement(ctx context.Context, id string) (*model.Secret, error) {
	return &model.Secret{}, nil
}
