package controllers

import (
	"bookstore/config"
	"bookstore/middleware"
	"bookstore/models"
	"bookstore/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CreateOrderRequest struct {
	Address string `json:"address" binding:"required"`
	Phone   string `json:"phone" binding:"required"`
}

func CreateOrder(c *gin.Context) {
	var req CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	if msg := utils.ValidateAddress(req.Address); msg != "" {
		utils.Error(c, http.StatusBadRequest, msg)
		return
	}
	if msg := utils.ValidatePhone(req.Phone); msg != "" {
		utils.Error(c, http.StatusBadRequest, msg)
		return
	}

	userID := middleware.GetCurrentUserID(c)

	tx := config.DB.Begin()

	cartItems, err := models.GetCartByUserID(userID)
	if err != nil || len(cartItems) == 0 {
		tx.Rollback()
		utils.Error(c, http.StatusBadRequest, "购物车为空")
		return
	}

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range cartItems {
		var book models.Book
		if err := tx.First(&book, item.BookID).Error; err != nil {
			tx.Rollback()
			utils.Error(c, http.StatusBadRequest, "图书不存在")
			return
		}

		if book.Stock < item.Quantity {
			tx.Rollback()
			utils.Error(c, http.StatusBadRequest, "库存不足")
			return
		}

		if err := tx.Model(&book).Update("stock", book.Stock-item.Quantity).Error; err != nil {
			tx.Rollback()
			utils.Error(c, http.StatusInternalServerError, "扣减库存失败")
			return
		}

		subtotal := float64(item.Quantity) * book.Price
		totalAmount += subtotal

		orderItems = append(orderItems, models.OrderItem{
			BookID:   item.BookID,
			Quantity: item.Quantity,
			Price:    book.Price,
		})
	}

	order := models.Order{
		UserID:      userID,
		OrderNo:     models.GenerateOrderNo(),
		TotalAmount: totalAmount,
		Address:     req.Address,
		Phone:       req.Phone,
		Status:      models.OrderStatusPending,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		utils.Error(c, http.StatusInternalServerError, "创建订单失败")
		return
	}

	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}
	if err := tx.Create(&orderItems).Error; err != nil {
		tx.Rollback()
		utils.Error(c, http.StatusInternalServerError, "创建订单项失败")
		return
	}

	if err := tx.Where("user_id = ?", userID).Delete(&models.Cart{}).Error; err != nil {
		tx.Rollback()
		utils.Error(c, http.StatusInternalServerError, "清空购物车失败")
		return
	}

	tx.Commit()

	utils.Success(c, "订单创建成功", gin.H{
		"id":           order.ID,
		"order_no":     order.OrderNo,
		"total_amount": order.TotalAmount,
		"status":       order.Status,
		"status_text":  models.OrderStatusText[order.Status],
		"created_at":   order.CreatedAt,
	})
}

func GetMyOrders(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	orders, err := models.GetOrdersByUserID(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "获取订单列表失败")
		return
	}

	utils.Success(c, "success", gin.H{
		"list": orders,
	})
}

func PayOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "订单ID无效")
		return
	}

	userID := middleware.GetCurrentUserID(c)
	order, err := models.GetOrderByID(uint(id))
	if err != nil || order.UserID != userID {
		utils.Error(c, http.StatusBadRequest, "订单不存在")
		return
	}

	if order.Status != models.OrderStatusPending {
		utils.Error(c, http.StatusBadRequest, "订单状态不允许支付")
		return
	}

	if err := models.UpdateOrderStatus(uint(id), models.OrderStatusPaid); err != nil {
		utils.Error(c, http.StatusInternalServerError, "支付失败")
		return
	}

	utils.Success(c, "支付成功", nil)
}

func CancelOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "订单ID无效")
		return
	}

	userID := middleware.GetCurrentUserID(c)
	order, err := models.GetOrderByID(uint(id))
	if err != nil || order.UserID != userID {
		utils.Error(c, http.StatusBadRequest, "订单不存在")
		return
	}

	if order.Status != models.OrderStatusPending {
		utils.Error(c, http.StatusBadRequest, "订单状态不允许取消")
		return
	}

	tx := config.DB.Begin()

	for _, item := range order.Items {
		if err := tx.Model(&models.Book{}).Where("id = ?", item.BookID).
			Update("stock", gorm.Expr("stock + ?", item.Quantity)).Error; err != nil {
			tx.Rollback()
			utils.Error(c, http.StatusInternalServerError, "恢复库存失败")
			return
		}
	}

	if err := tx.Model(&order).Update("status", models.OrderStatusCancelled).Error; err != nil {
		tx.Rollback()
		utils.Error(c, http.StatusInternalServerError, "取消订单失败")
		return
	}

	tx.Commit()

	utils.Success(c, "订单已取消", nil)
}

func ConfirmOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "订单ID无效")
		return
	}

	userID := middleware.GetCurrentUserID(c)
	order, err := models.GetOrderByID(uint(id))
	if err != nil || order.UserID != userID {
		utils.Error(c, http.StatusBadRequest, "订单不存在")
		return
	}

	if order.Status != models.OrderStatusPaid {
		utils.Error(c, http.StatusBadRequest, "订单状态不允许确认收货")
		return
	}

	if err := models.UpdateOrderStatus(uint(id), models.OrderStatusCompleted); err != nil {
		utils.Error(c, http.StatusInternalServerError, "确认收货失败")
		return
	}

	utils.Success(c, "已确认收货", nil)
}
