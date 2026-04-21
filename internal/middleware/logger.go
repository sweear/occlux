package middleware

import (
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/sweear/occlux/internal/logger"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		path := c.Request.URL.Path

		if !strings.HasPrefix(path, "/api/") {
			c.Next()
			return
		}

		start := time.Now()
		requestID := uuid.New().String()

		c.Set("request_id", requestID)
		c.Header("X-Request-ID", requestID)

		c.Next()

		logger.Info("request",
			"request_id", requestID,
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"duration_ms", time.Since(start).Milliseconds(),
			"ip", c.ClientIP(),
		)
	}
}
