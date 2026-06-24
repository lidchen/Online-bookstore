package main

import (
	"fmt"
	"log"
	"os"

	"bookstore/config"
	"bookstore/models"
	"bookstore/routes"

	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config.ConnectDB()
	models.SetDB(config.DB)

	if err := models.AutoMigrate(config.DB); err != nil {
		log.Fatalf("Failed to auto migrate: %v", err)
	}
	models.InitSeedData(config.DB)

	r := gin.Default()

	store := cookie.NewStore([]byte(os.Getenv("SESSION_SECRET")))
	store.Options(sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: true,
	})
	r.Use(sessions.Sessions("bookstore_session", store))

	r.Use(corsMiddleware())

	r.Static("/static", "./static")

	// 从后端直接提供前端文件，这样前端和后端同源，无需跨域 cookie
	// 访问 http://localhost:8080/ 即可使用完整应用
	r.Static("/", "../frontend")

	routes.SetupRoutes(r)

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on :%s\n", port)
	if err := r.Run(fmt.Sprintf(":%s", port)); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		c.Header("Access-Control-Allow-Origin", origin)
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 预检请求缓存 24 小时
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
