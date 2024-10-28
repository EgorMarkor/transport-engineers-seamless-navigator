package middleware

import (
	"github.com/EgorMarkor/transport-engineers-seamless-navigator/internal/tokenutil"
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func JwtAuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.Request.Header.Get("Authorization")

		t := strings.Split(authHeader, " ")
		if len(t) != 2 {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authorized"})
			c.Abort()
			return
		}

		authToken := t[1]

		isAuthorized, err := tokenutil.IsAuthorized(authToken, secret)
		if !isAuthorized {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		userID, err := tokenutil.ExtractIDFromToken(authToken, secret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}

		c.Set("x-user-id", userID)
		c.Next()
	}
}
