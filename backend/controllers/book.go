package controllers

import (
	"bookstore/models"
	"bookstore/utils"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func GetBooks(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "12"))
	keyword := c.Query("keyword")
	categoryID, _ := strconv.Atoi(c.DefaultQuery("category_id", "0"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 12
	}

	status := models.StatusOnShelf
	query := models.BookListQuery{
		Page:       page,
		PageSize:   pageSize,
		Keyword:    keyword,
		CategoryID: uint(categoryID),
		Status:     &status,
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

func GetBook(c *gin.Context) {
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

	utils.Success(c, "success", book)
}
