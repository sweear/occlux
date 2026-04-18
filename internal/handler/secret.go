package handler

import (
	"github.com/gin-gonic/gin"
)

type SecretHandler struct {
}

func NewSecretHandler() *SecretHandler {
	return &SecretHandler{}
}

func (s *SecretHandler) Create(c *gin.Context) {

}

func (s *SecretHandler) GetByID(c *gin.Context) {

}
