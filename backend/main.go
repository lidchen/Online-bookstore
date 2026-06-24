package main

import (
	"fmt"
	"log"
	"net/http"
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
		SameSite: http.SameSiteLaxMode,
		Secure:   false,
	})
	r.Use(sessions.Sessions("bookstore_session", store))

	r.Use(corsMiddleware())

	// 上传文件目录
	r.Static("/static", "./static")

	// 从后端直接提供前端文件，前端和后端同源，无需跨域 cookie
	// 访问 http://localhost:8080/ 即可使用完整应用
	// NoRoute 只在没有匹配到 API 路由时才处理，不会与 /api/* 冲突
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		// 尝试从 frontend 目录提供文件
		filePath := "../frontend" + path
		if _, err := os.Stat(filePath); err == nil {
			c.File(filePath)
			return
		}
		// 对 SPA 路由或目录路径，返回 index.html
		indexPath := "../frontend" + path
		if path == "/" || path[len(path)-1] == '/' {
			indexPath += "index.html"
		}
		if _, err := os.Stat(indexPath); err == nil {
			c.File(indexPath)
			return
		}
		c.File("../frontend/index.html")
	})

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
