package service

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/sweear/occlux/internal/model"
	secretStorage "github.com/sweear/occlux/internal/storage/secret"
)

type CreateSecretParams struct {
	EncryptedData string
	MaxViews      int
	TTLMinutes    int
}

type SecretService struct {
	secretStorage secretStorage.SecretStorage
}

func NewSecretService(secretStorage secretStorage.SecretStorage) *SecretService {
	return &SecretService{
		secretStorage: secretStorage,
	}
}

func (s *SecretService) Create(ctx context.Context,
	params CreateSecretParams) (*model.Secret, error) {

	id := uuid.New().String()

	secret := model.Secret{
		ID:            id,
		EncryptedData: params.EncryptedData,
		MaxViews:      params.MaxViews,
		ExpiresAt:     time.Now().Add(time.Minute * time.Duration(params.TTLMinutes)),
	}

	err := s.secretStorage.Save(ctx, &secret)
	if err != nil {
		return nil, err
	}

	return &secret, nil
}

func (s *SecretService) GetByID(ctx context.Context, id string) (*model.Secret, error) {

	secret, err := s.secretStorage.GetAndDecrement(ctx, id)
	if err != nil {
		return nil, err
	}

	return secret, nil
}
