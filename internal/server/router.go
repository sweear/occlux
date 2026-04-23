package server

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/sweear/occlux/internal/handler"
	"github.com/sweear/occlux/internal/logger"
	"github.com/sweear/occlux/internal/middleware"
)

func NewRouter(secretHandler *handler.SecretHandler,
	healthHandler *handler.HealthHandler,
	staticFiles embed.FS) http.Handler {

	gin.SetMode(gin.ReleaseMode)

	router := gin.New()

	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.Security())

	api := router.Group("/api/v1")
	registerSecretRoutes(api, secretHandler)

	health := router.Group("/health")
	registerHealthRoutes(health, healthHandler)

	registerStaticFiles(router, staticFiles)

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

func registerStaticFiles(router *gin.Engine, staticFiles embed.FS) {
	sub, _ := fs.Sub(staticFiles, "dist")

	indexHTML, _ := fs.ReadFile(sub, "index.html")

	fileServer := http.FileServer(http.FS(sub))

	router.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path

		if strings.HasPrefix(path, "/assets/") {
			fileServer.ServeHTTP(c.Writer, c.Request)
			return
		}

		c.Data(http.StatusOK, "text/html; charset=utf-8", indexHTML)
	})
}
