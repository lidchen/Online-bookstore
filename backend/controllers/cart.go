package controllers

import (
	"bookstore/middleware"
	"bookstore/models"
	"bookstore/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetCart(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)

	items, err := models.GetCartByUserID(userID)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "获取购物车失败")
		return
	}

	var totalAmount float64
	for _, item := range items {
		totalAmount += float64(item.Quantity) * item.Book.Price
	}

	utils.Success(c, "success", gin.H{
		"items":        items,
		"total_amount": totalAmount,
	})
}

type AddToCartRequest struct {
	BookID   uint `json:"book_id" binding:"required"`
	Quantity int  `json:"quantity"`
}

func AddToCart(c *gin.Context) {
	var req AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	if req.Quantity < 1 {
		req.Quantity = 1
	}

	book, err := models.GetBookByID(req.BookID)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "图书不存在")
		return
	}

	if book.Status != models.StatusOnShelf {
		utils.Error(c, http.StatusBadRequest, "图书已下架")
		return
	}

	existing, _ := models.GetCartItem(middleware.GetCurrentUserID(c), req.BookID)
	newQuantity := req.Quantity
	if existing != nil {
		newQuantity = existing.Quantity + req.Quantity
	}

	if newQuantity > book.Stock {
		utils.Error(c, http.StatusBadRequest, "库存不足")
		return
	}

	userID := middleware.GetCurrentUserID(c)
	if err := models.AddToCart(userID, req.BookID, req.Quantity); err != nil {
		utils.Error(c, http.StatusInternalServerError, "加入购物车失败")
		return
	}

	utils.Success(c, "已加入购物车", nil)
}

type UpdateCartRequest struct {
	Quantity int `json:"quantity" binding:"required"`
}

func UpdateCart(c *gin.Context) {
	bookIDStr := c.Param("book_id")
	bookID, err := strconv.ParseUint(bookIDStr, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "图书ID无效")
		return
	}

	var req UpdateCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	if req.Quantity < 1 {
		utils.Error(c, http.StatusBadRequest, "数量必须大于0")
		return
	}

	book, err := models.GetBookByID(uint(bookID))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "图书不存在")
		return
	}

	if req.Quantity > book.Stock {
		utils.Error(c, http.StatusBadRequest, "数量不能超过库存")
		return
	}

	userID := middleware.GetCurrentUserID(c)
	if err := models.UpdateCartQuantity(userID, uint(bookID), req.Quantity); err != nil {
		utils.Error(c, http.StatusInternalServerError, "更新购物车失败")
		return
	}

	utils.Success(c, "购物车已更新", nil)
}

func RemoveFromCart(c *gin.Context) {
	bookIDStr := c.Param("book_id")
	bookID, err := strconv.ParseUint(bookIDStr, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "图书ID无效")
		return
	}

	userID := middleware.GetCurrentUserID(c)
	if err := models.RemoveFromCart(userID, uint(bookID)); err != nil {
		utils.Error(c, http.StatusInternalServerError, "删除失败")
		return
	}

	utils.Success(c, "商品已移除", nil)
}

func ClearCart(c *gin.Context) {
	userID := middleware.GetCurrentUserID(c)
	if err := models.ClearCart(userID); err != nil {
		utils.Error(c, http.StatusInternalServerError, "清空购物车失败")
		return
	}

	utils.Success(c, "购物车已清空", nil)
}
