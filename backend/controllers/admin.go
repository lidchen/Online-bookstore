package controllers

import (
	"bookstore/models"
	"bookstore/utils"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func AdminGetBooks(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "12"))
	keyword := c.Query("keyword")
	statusStr := c.Query("status")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 12
	}

	query := models.BookListQuery{
		Page:     page,
		PageSize: pageSize,
		Keyword:  keyword,
	}

	if statusStr != "" {
		s, err := strconv.Atoi(statusStr)
		if err == nil && (s == 0 || s == 1) {
			query.Status = &s
		}
	}

	books, total, err := models.GetBooks(query)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "获取图书列表失败")
		return
	}

	utils.Success(c, "success", gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      books,
	})
}

func AdminCreateBook(c *gin.Context) {
	title := c.PostForm("title")
	author := c.PostForm("author")
	priceStr := c.PostForm("price")
	stockStr := c.PostForm("stock")
	categoryIDStr := c.PostForm("category_id")
	description := c.PostForm("description")

	if title == "" || author == "" || priceStr == "" || stockStr == "" || categoryIDStr == "" {
		utils.Error(c, http.StatusBadRequest, "请填写必填字段")
		return
	}

	price, _ := strconv.ParseFloat(priceStr, 64)
	stock, _ := strconv.Atoi(stockStr)
	categoryID, _ := strconv.ParseUint(categoryIDStr, 10, 64)

	coverURL := ""
	file, header, err := c.Request.FormFile("cover")
	if err == nil {
		defer file.Close()
		ext := filepath.Ext(header.Filename)
		filename := fmt.Sprintf("%d_%d%s", time.Now().UnixMilli(), stock, ext)
		savePath := filepath.Join("static", "uploads", filename)
		out, err := os.Create(savePath)
		if err == nil {
			defer out.Close()
			io.Copy(out, file)
			coverURL = "/static/uploads/" + filename
		}
	}

	if coverURL == "" {
		coverURL = "/static/uploads/default_cover.jpg"
	}

	book := models.Book{
		Title:       title,
		Author:      author,
		Price:       price,
		Stock:       stock,
		CategoryID:  uint(categoryID),
		Description: description,
		CoverURL:    coverURL,
		Status:      models.StatusOnShelf,
	}

	if err := models.CreateBook(&book); err != nil {
		utils.Error(c, http.StatusInternalServerError, "添加图书失败")
		return
	}

	utils.Success(c, "图书添加成功", gin.H{
		"id": book.ID,
	})
}

func AdminUpdateBook(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "图书ID无效")
		return
	}

	book, err := models.GetBookByID(uint(id))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "图书不存在")
		return
	}

	if title := c.PostForm("title"); title != "" {
		book.Title = title
	}
	if author := c.PostForm("author"); author != "" {
		book.Author = author
	}
	if priceStr := c.PostForm("price"); priceStr != "" {
		price, _ := strconv.ParseFloat(priceStr, 64)
		book.Price = price
	}
	if stockStr := c.PostForm("stock"); stockStr != "" {
		stock, _ := strconv.Atoi(stockStr)
		book.Stock = stock
	}
	if categoryIDStr := c.PostForm("category_id"); categoryIDStr != "" {
		categoryID, _ := strconv.ParseUint(categoryIDStr, 10, 64)
		book.CategoryID = uint(categoryID)
	}
	if description := c.PostForm("description"); description != "" {
		book.Description = description
	}

	file, header, err := c.Request.FormFile("cover")
	if err == nil {
		defer file.Close()
		ext := filepath.Ext(header.Filename)
		filename := fmt.Sprintf("%d_%d%s", time.Now().UnixMilli(), book.ID, ext)
		savePath := filepath.Join("static", "uploads", filename)
		out, err := os.Create(savePath)
		if err == nil {
			defer out.Close()
			io.Copy(out, file)
			book.CoverURL = "/static/uploads/" + filename
		}
	}

	if err := models.UpdateBook(book); err != nil {
		utils.Error(c, http.StatusInternalServerError, "更新图书失败")
		return
	}

	utils.Success(c, "图书信息已更新", nil)
}

func AdminDeleteBook(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "图书ID无效")
		return
	}

	if _, err := models.GetBookByID(uint(id)); err != nil {
		utils.Error(c, http.StatusBadRequest, "图书不存在")
		return
	}

	if err := models.DeleteBook(uint(id)); err != nil {
		utils.Error(c, http.StatusInternalServerError, "删除图书失败")
		return
	}

	utils.Success(c, "图书已删除", nil)
}

type UpdateBookStatusRequest struct {
	Status int `json:"status" binding:"required"`
}

func AdminUpdateBookStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "图书ID无效")
		return
	}

	var req UpdateBookStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	if req.Status != 0 && req.Status != 1 {
		utils.Error(c, http.StatusBadRequest, "状态值无效，必须是0或1")
		return
	}

	if _, err := models.GetBookByID(uint(id)); err != nil {
		utils.Error(c, http.StatusBadRequest, "图书不存在")
		return
	}

	if err := models.UpdateBookStatus(uint(id), req.Status); err != nil {
		utils.Error(c, http.StatusInternalServerError, "更新图书状态失败")
		return
	}

	utils.Success(c, "图书状态已更新", nil)
}

func AdminGetOrders(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "12"))
	statusStr := c.Query("status")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 12
	}

	query := models.OrderListQuery{
		Page:     page,
		PageSize: pageSize,
	}

	if statusStr != "" {
		s, err := strconv.Atoi(statusStr)
		if err == nil && s >= 0 && s <= 3 {
			query.Status = &s
		}
	}

	orders, total, err := models.GetAllOrders(query)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "获取订单列表失败")
		return
	}

	utils.Success(c, "success", gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"list":      orders,
	})
}

func AdminShipOrder(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "订单ID无效")
		return
	}

	order, err := models.GetOrderByID(uint(id))
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "订单不存在")
		return
	}

	if order.Status != models.OrderStatusPaid {
		utils.Error(c, http.StatusBadRequest, "订单状态不允许发货")
		return
	}

	if err := models.UpdateOrderStatus(uint(id), models.OrderStatusCompleted); err != nil {
		utils.Error(c, http.StatusInternalServerError, "发货失败")
		return
	}

	utils.Success(c, "已发货", nil)
}
