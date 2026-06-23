package models

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Password  string    `gorm:"size:100;not null" json:"-"`
	Role      string    `gorm:"size:20;default:user" json:"role"`
	CreatedAt time.Time `json:"created_at"`
}

func CheckUsernameExists(username string) bool {
	var count int64
	db.Model(&User{}).Where("username = ?", username).Count(&count)
	return count > 0
}

func GetUserByUsername(username string) (*User, error) {
	var user User
	err := db.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func GetUserByID(id uint) (*User, error) {
	var user User
	err := db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func CreateUser(user *User) error {
	return db.Create(user).Error
}
