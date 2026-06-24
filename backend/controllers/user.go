package controllers

import (
	"bookstore/models"
	"bookstore/utils"
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Username        string `json:"username" binding:"required"`
	Password        string `json:"password" binding:"required"`
	ConfirmPassword string `json:"confirm_password" binding:"required"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	if msg := utils.ValidateUsername(req.Username); msg != "" {
		utils.Error(c, http.StatusBadRequest, msg)
		return
	}
	if msg := utils.ValidatePassword(req.Password); msg != "" {
		utils.Error(c, http.StatusBadRequest, msg)
		return
	}
	if req.Password != req.ConfirmPassword {
		utils.Error(c, http.StatusBadRequest, "两次输入的密码不一致")
		return
	}
	if models.CheckUsernameExists(req.Username) {
		utils.Error(c, http.StatusBadRequest, "用户名已存在")
		return
	}

	user := &models.User{
		Username: req.Username,
		Password: req.Password,
		Role:     "user",
	}
	if err := models.CreateUser(user); err != nil {
		utils.Error(c, http.StatusInternalServerError, "注册失败")
		return
	}

	utils.Success(c, "注册成功", gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"role":       user.Role,
		"created_at": user.CreatedAt,
	})
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "请求参数错误")
		return
	}

	user, err := models.GetUserByUsername(req.Username)
	if err != nil {
		utils.Error(c, http.StatusOK, "用户名或密码错误")
		return
	}

	if user.Password != req.Password {
		utils.Error(c, http.StatusOK, "用户名或密码错误")
		return
	}

	session := sessions.Default(c)
	session.Set("user_id", user.ID)
	session.Set("username", user.Username)
	session.Set("role", user.Role)
	if err := session.Save(); err != nil {
		log.Printf("Failed to save session: %v", err)
	}

	token, err := utils.GenerateToken(utils.TokenData{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		IssuedAt: time.Now().Unix(),
	})
	if err != nil {
		log.Printf("Failed to generate token: %v", err)
		utils.Error(c, http.StatusInternalServerError, "登录失败，请重试")
		return
	}

	utils.Success(c, "登录成功", gin.H{
		"id":       user.ID,
		"username": user.Username,
		"role":     user.Role,
		"token":    token,
	})
}

func CheckSession(c *gin.Context) {
	userID, _ := c.Get("user_id")
	username, _ := c.Get("username")
	role, _ := c.Get("role")
	utils.Success(c, "ok", gin.H{
		"id":       userID,
		"username": username,
		"role":     role,
	})
}

func Logout(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	session.Save()

	utils.Success(c, "已退出登录", nil)
}
