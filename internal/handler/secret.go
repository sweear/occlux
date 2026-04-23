package handler

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/sweear/occlux/internal/service"
)

type createSecretRequest struct {
	EncryptedData string `json:"encryptedData" binding:"required,max=14000"`
	MaxViews      int    `json:"maxViews" binding:"required,min=1,max=100"`
	TTLMinutes    int    `json:"ttlMinutes" binding:"required,min=1,max=4320"`
}

type createSecretResponse struct {
	Success   bool      `json:"success"`
	ID        string    `json:"id"`
	ExpiresAt time.Time `json:"expiresAt"`
}

type getSecretResponse struct {
	Success       bool   `json:"success"`
	EncryptedData string `json:"encryptedData"`
}

type errorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

type SecretHandler struct {
	service *service.SecretService
}

func NewSecretHandler(service *service.SecretService) *SecretHandler {
	return &SecretHandler{
		service: service,
	}
}

func (s *SecretHandler) Create(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 1<<15)

	var req createSecretRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, errorResponse{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	secret, err := s.service.Create(c.Request.Context(), service.CreateSecretParams{
		EncryptedData: req.EncryptedData,
		MaxViews:      req.MaxViews,
		TTLMinutes:    req.TTLMinutes,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse{
			Success: false,
			Error:   "internal server error",
		})
		return
	}

	c.JSON(http.StatusCreated, createSecretResponse{
		Success:   true,
		ID:        secret.ID,
		ExpiresAt: secret.ExpiresAt,
	})
}

func (s *SecretHandler) GetByID(c *gin.Context) {
	secret, err := s.service.GetByID(c.Request.Context(), c.Param("id"))
	if errors.Is(err, service.ErrSecretNotFound) {
		c.JSON(http.StatusNotFound, errorResponse{
			Success: false,
			Error:   "secret not found or expired",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, errorResponse{
			Success: false,
			Error:   "internal server error",
		})
		return
	}

	c.JSON(http.StatusOK, getSecretResponse{
		Success:       true,
		EncryptedData: secret.EncryptedData,
	})
}
