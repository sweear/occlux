package service

import (
	"context"

	"github.com/sweear/occlux/internal/model"
)

type CreateSecretParams struct {
	EncryptedData string
	MaxViews      int
	TTLMinutes    int
}

type SecretService struct {
}

func NewSecretService() *SecretService {
	return &SecretService{}
}

func (s *SecretService) Create(ctx context.Context,
	params CreateSecretParams) (*model.Secret, error) {

	return &model.Secret{}, nil
}

func (s *SecretService) GetByID(ctx context.Context, id string) (*model.Secret, error) {
	return &model.Secret{}, nil
}
