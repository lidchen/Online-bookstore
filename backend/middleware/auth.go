package middleware

import (
	"bookstore/utils"
	"net/http"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		userID := session.Get("user_id")
		if userID == nil {
			utils.Unauthorized(c)
			c.Abort()
			return
		}
		c.Set("user_id", userID.(uint))
		c.Set("username", session.Get("username"))
		c.Set("role", session.Get("role"))
		c.Next()
	}
}

func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		role := session.Get("role")
		if role == nil || role.(string) != "admin" {
			utils.Forbidden(c)
			c.Abort()
			return
		}
		c.Next()
	}
}

func GetCurrentUserID(c *gin.Context) uint {
	userID, _ := c.Get("user_id")
	if userID == nil {
		return 0
	}
	return userID.(uint)
}

func GetCurrentUserRole(c *gin.Context) string {
	role, _ := c.Get("role")
	if role == nil {
		return ""
	}
	return role.(string)
}

// Allow methods for OPTIONS requests
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "http://localhost:5500")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
