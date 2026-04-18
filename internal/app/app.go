package app

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/sweear/occlux/internal/config"
	"github.com/sweear/occlux/internal/handler"
	"github.com/sweear/occlux/internal/logger"
	"github.com/sweear/occlux/internal/server"
)

type App struct {
	server *server.Server
}

func NewApp() *App {
	logger.Init()

	cfg := config.Load()
	logger.Info("config loaded", "addr", ":"+cfg.Port)

	secretHandler := handler.NewSecretHandler()
	logger.Info("secret handler initialized")

	router := server.NewRouter(secretHandler)
	logger.Info("router created")

	server := server.NewServer(cfg, router)
	logger.Info("server created")

	return &App{
		server: server,
	}
}

func (a *App) Run() {
	logger.Info("app starting")

	go func() {
		if err := a.server.Run(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	logger.Info("app started")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("app stopping")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := a.server.Stop(ctx); err != nil {
		logger.Error("shutdown error", "err", err)
	}

	logger.Info("app stopped")

	logger.Sync()
}
