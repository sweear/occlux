package server

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sweear/occlux/internal/handler"
	"github.com/sweear/occlux/internal/logger"
	"github.com/sweear/occlux/internal/middleware"
)

func NewRouter(secretHandler *handler.SecretHandler) http.Handler {
	gin.SetMode(gin.ReleaseMode)

	router := gin.New()

	router.Use(cors.Default()) // заменить потом на нужные корсы ток моего фронта
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())

	api := router.Group("/api/v1")
	registerSecretRoutes(api, secretHandler)

	logger.Info("routes registered",
		"POST", "/api/v1/secrets",
		"GET", "/api/v1/secrets/:id",
	)

	return router
}

func registerSecretRoutes(api *gin.RouterGroup, h *handler.SecretHandler) {
	secrets := api.Group("/secrets")
	{
		secrets.POST("", h.Create)
		secrets.GET("/:id", h.GetByID)
	}
}
