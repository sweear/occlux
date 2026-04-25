package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"github.com/sweear/occlux/internal/logger"
	limiter "github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	redisstore "github.com/ulule/limiter/v3/drivers/store/redis"
)

func RateLimit(client *redis.Client, rateStr string) gin.HandlerFunc {
	rate, err := limiter.NewRateFromFormatted(rateStr)
	if err != nil {
		logger.Fatal("invalid rate limit format", "rate", rateStr, "error", err)
	}

	store, err := redisstore.NewStore(client)
	if err != nil {
		logger.Fatal("failed to create rate limit store", "error", err)
	}

	return mgin.NewMiddleware(limiter.New(store, rate))
}
