package utils

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func Success(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    200,
		Message: message,
		Data:    data,
	})
}

func Error(c *gin.Context, code int, message string) {
	c.JSON(code, Response{
		Code:    code,
		Message: message,
	})
}

func Unauthorized(c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code:    401,
		Message: "请先登录",
	})
}

func Forbidden(c *gin.Context) {
	c.JSON(http.StatusOK, Response{
		Code:    403,
		Message: "无权限访问",
	})
}
