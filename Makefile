.PHONY: build run dev

build:
	cd web && npm install && npm run build
	touch internal/app/dist/.gitkeep
	go build -o bin/occlux-server ./cmd/occlux-server

run:
	./bin/occlux-server

dev:
	go run ./cmd/occlux-server