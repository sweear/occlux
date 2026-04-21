.PHONY: build run dev

build:
	cd web && npm install && npm run build
	touch internal/app/dist/.gitkeep
	go build -o bin/occlux ./cmd/server

run: build
	./bin/occlux

dev:
	go run ./cmd/server