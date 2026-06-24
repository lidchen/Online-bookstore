package middleware

import (
	"bookstore/utils"
	"strings"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Token-based auth via Authorization header
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			token := strings.TrimPrefix(authHeader, "Bearer ")
			data, err := utils.ParseToken(token)
			if err == nil {
				c.Set("user_id", data.UserID)
				c.Set("username", data.Username)
				c.Set("role", data.Role)
				c.Next()
				return
			}
		}

		// Fallback: session cookie
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
		role, _ := c.Get("role")
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
