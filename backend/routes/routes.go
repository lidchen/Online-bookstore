package routes

import (
	"bookstore/controllers"
	"bookstore/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		// Public routes - no auth required
		api.POST("/register", controllers.Register)
		api.POST("/login", controllers.Login)

		// Books - public read
		api.GET("/books", controllers.GetBooks)
		api.GET("/books/:id", controllers.GetBook)

		// Protected routes - auth required
		auth := api.Group("")
		auth.Use(middleware.AuthRequired())
		{
			auth.POST("/logout", controllers.Logout)
			auth.GET("/session", controllers.CheckSession)

			// Cart
			auth.GET("/cart", controllers.GetCart)
			auth.POST("/cart", controllers.AddToCart)
			auth.PUT("/cart/:book_id", controllers.UpdateCart)
			auth.DELETE("/cart/:book_id", controllers.RemoveFromCart)
			auth.DELETE("/cart", controllers.ClearCart)

			// Orders
			auth.POST("/orders", controllers.CreateOrder)
			auth.GET("/orders", controllers.GetMyOrders)
			auth.PUT("/orders/:id/pay", controllers.PayOrder)
			auth.PUT("/orders/:id/cancel", controllers.CancelOrder)
			auth.PUT("/orders/:id/confirm", controllers.ConfirmOrder)
		}

		// Admin routes - auth + admin role required
		admin := api.Group("/admin")
		admin.Use(middleware.AuthRequired(), middleware.AdminRequired())
		{
			admin.GET("/books", controllers.AdminGetBooks)
			admin.POST("/books", controllers.AdminCreateBook)
			admin.PUT("/books/:id", controllers.AdminUpdateBook)
			admin.DELETE("/books/:id", controllers.AdminDeleteBook)
			admin.PATCH("/books/:id/status", controllers.AdminUpdateBookStatus)

			admin.GET("/orders", controllers.AdminGetOrders)
			admin.PATCH("/orders/:id/ship", controllers.AdminShipOrder)
		}
	}
}
