package utils

import (
	"os"
	"time"

	"github.com/gorilla/securecookie"
)

var tokenSC *securecookie.SecureCookie

func init() {
	hashKey := []byte(os.Getenv("SESSION_SECRET"))
	if len(hashKey) == 0 {
		hashKey = []byte("fallback-token-secret")
	}
	tokenSC = securecookie.New(hashKey, nil)
	tokenSC.SetSerializer(securecookie.JSONEncoder{})
}

type TokenData struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	Role     string `json:"role"`
	IssuedAt int64  `json:"issued_at"`
}

func GenerateToken(data TokenData) (string, error) {
	return tokenSC.Encode("token", data)
}

func ParseToken(token string) (*TokenData, error) {
	var data TokenData
	if err := tokenSC.Decode("token", token, &data); err != nil {
		return nil, err
	}
	if time.Now().Unix()-data.IssuedAt > 86400*7 {
		return nil, securecookie.ErrMacInvalid
	}
	return &data, nil
}
