package app

import (
	"github.com/sweear/occlux/internal/logger"
)

type Runnable interface {
	Run() error
	Stop() error
}

type App struct {
	components []Runnable
}

func NewApp() *App {
	return &App{}
}

func (a *App) Run() error {
	logger.Init()
	defer logger.Sync()

	//cfg := config.Load()

	// server := server.NewServer(cfg, ...)
	// logger.Info("server created successfully", "addr", httpServer.Addr)

	logger.Info("app run")
	return nil
}
