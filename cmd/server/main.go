package main

import (
	"github.com/sweear/occlux/internal/app"
	"github.com/sweear/occlux/internal/logger"
)

func main() {
	logger.Init()
	defer logger.Sync()
	app := app.NewApp()
	app.Run()
}
