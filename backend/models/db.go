package models

import (
	"log"

	"gorm.io/gorm"
)

var db *gorm.DB

func SetDB(database *gorm.DB) {
	db = database
}

func AutoMigrate(database *gorm.DB) error {
	return database.AutoMigrate(
		&User{},
		&Category{},
		&Book{},
		&Cart{},
		&Order{},
		&OrderItem{},
	)
}

func InitSeedData(database *gorm.DB) {
	var count int64
	database.Model(&Category{}).Count(&count)
	if count == 0 {
		categories := []Category{
			{Name: "文学"},
			{Name: "科技"},
			{Name: "少儿"},
			{Name: "教育"},
			{Name: "网络文学"},
		}
		database.Create(&categories)
		log.Println("Initialized categories seed data")
	}

	database.Model(&User{}).Where("username = ?", "admin").Count(&count)
	if count == 0 {
		admin := User{
			Username: "admin",
			Password: "admin123",
			Role:     "admin",
		}
		database.Create(&admin)
		log.Println("Initialized admin user")
	}
}
