package secretStorage

import (
	"context"

	"github.com/sweear/occlux/internal/model"
)

type SecretStorage interface {
	Save(ctx context.Context, secret *model.Secret) error
	GetAndDecrement(ctx context.Context, id string) (*model.Secret, error)
}
