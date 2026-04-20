package server

import (
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sweear/occlux/internal/handler"
	"github.com/sweear/occlux/internal/logger"
	"github.com/sweear/occlux/internal/middleware"
)

func NewRouter(secretHandler *handler.SecretHandler,
	healthHandler *handler.HealthHandler) http.Handler {

	gin.SetMode(gin.ReleaseMode)

	router := gin.New()

	router.Use(cors.Default()) // заменить потом на нужные корсы ток моего фронта
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())

	api := router.Group("/api/v1")
	registerSecretRoutes(api, secretHandler)

	health := router.Group("/health")
	registerHealthRoutes(health, healthHandler)

	for _, route := range router.Routes() {
		logger.Info("route registered", "method", route.Method, "path", route.Path)
	}

	return router
}

func registerSecretRoutes(api *gin.RouterGroup, h *handler.SecretHandler) {
	secrets := api.Group("/secrets")
	{
		secrets.POST("", h.Create)
		secrets.GET("/:id", h.GetByID)
	}
}

func registerHealthRoutes(health *gin.RouterGroup, h *handler.HealthHandler) {
	health.GET("", h.Health)
}
