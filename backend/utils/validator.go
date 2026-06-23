package utils

import (
	"regexp"
	"strings"
)

func ValidateUsername(username string) string {
	username = strings.TrimSpace(username)
	if username == "" {
		return "用户名不能为空"
	}
	if len(username) < 3 || len(username) > 20 {
		return "用户名长度必须在3-20个字符之间"
	}
	return ""
}

func ValidatePassword(password string) string {
	if password == "" {
		return "密码不能为空"
	}
	if len(password) < 6 || len(password) > 20 {
		return "密码长度必须在6-20个字符之间"
	}
	return ""
}

func ValidatePhone(phone string) string {
	if phone == "" {
		return "联系电话不能为空"
	}
	matched, _ := regexp.MatchString(`^1\d{10}$`, phone)
	if !matched {
		return "请输入正确的手机号"
	}
	return ""
}

func ValidateAddress(address string) string {
	address = strings.TrimSpace(address)
	if address == "" {
		return "收货地址不能为空"
	}
	return ""
}
