FROM node:20-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package.json web/package-lock.json .
RUN npm ci --silent
COPY web/ .
RUN npm run build

FROM golang:1.25-alpine AS backend-builder
WORKDIR /app
COPY go.mod go.sum .
RUN apk add --no-cache git && GOPROXY=direct go mod download
COPY . .
COPY --from=frontend-builder /app/internal/app/dist ./internal/app/dist
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o server ./cmd/server

FROM scratch
COPY --from=backend-builder /app/server /server
EXPOSE 8080
ENTRYPOINT ["/server"]