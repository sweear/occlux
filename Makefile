.PHONY: build run dev release

build:
	cd web && npm install && npm run build
	touch internal/app/dist/.gitkeep
	go build -o bin/occlux-server ./cmd/occlux-server
	go build -o bin/occlux ./cmd/occlux

run:
	./bin/occlux-server

dev:
	go run ./cmd/occlux-server

release:
	GOOS=linux   GOARCH=amd64 go build -ldflags="-w -s" -o bin/occlux-linux-amd64   ./cmd/occlux
	GOOS=darwin  GOARCH=amd64 go build -ldflags="-w -s" -o bin/occlux-darwin-amd64  ./cmd/occlux
	GOOS=darwin  GOARCH=arm64 go build -ldflags="-w -s" -o bin/occlux-darwin-arm64  ./cmd/occlux
	GOOS=windows GOARCH=amd64 go build -ldflags="-w -s" -o bin/occlux-windows-amd64.exe ./cmd/occlux