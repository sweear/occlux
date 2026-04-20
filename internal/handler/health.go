package handler

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
)

type HealthChecker interface {
	Ping(ctx context.Context) error
}

type HealthHandler struct {
	checkers []HealthChecker
}

func NewHealthHandler(checkers ...HealthChecker) *HealthHandler {
	return &HealthHandler{
		checkers: checkers,
	}
}

func (h *HealthHandler) Health(c *gin.Context) {
	for _, check := range h.checkers {
		if err := check.Ping(c.Request.Context()); err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"status": "unavailable"})
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
