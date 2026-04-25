package middleware

import "github.com/gin-gonic/gin"

func Security() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("Referrer-Policy", "no-referrer")
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		c.Header("Content-Security-Policy",
			"default-src 'self'; "+
				"script-src 'self' https://stats.occlux.tech; "+
				"connect-src 'self' https://stats.occlux.tech; "+
				"style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "+
				"font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;")
		c.Next()
	}
}
