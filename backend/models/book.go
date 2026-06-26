package models

import (
	"time"

	"gorm.io/gorm"
)

const (
	StatusOffShelf = 0
	StatusOnShelf  = 1
)

type Book struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `gorm:"size:200;not null" json:"title"`
	Author      string    `gorm:"size:100;not null" json:"author"`
	Price       float64   `gorm:"type:decimal(10,2);not null" json:"price"`
	Stock       int       `gorm:"not null;default:0" json:"stock"`
	CategoryID  uint      `gorm:"index" json:"category_id"`
	Category    *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Description string    `gorm:"type:text" json:"description"`
	CoverURL    string    `gorm:"size:500" json:"cover_url"`
	Status      int            `gorm:"default:1;index" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at"`
}

type BookListQuery struct {
	Page       int
	PageSize   int
	Keyword    string
	CategoryID uint
	Status     *int
}

func GetBooks(query BookListQuery) ([]Book, int64, error) {
	var books []Book
	var total int64

	q := db.Model(&Book{}).Preload("Category")

	if query.Status != nil {
		q = q.Where("status = ?", *query.Status)
	}

	if query.Keyword != "" {
		q = q.Where("title LIKE ? OR author LIKE ?", "%"+query.Keyword+"%", "%"+query.Keyword+"%")
	}

	if query.CategoryID > 0 {
		q = q.Where("category_id = ?", query.CategoryID)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (query.Page - 1) * query.PageSize
	if err := q.Order("created_at DESC").Offset(offset).Limit(query.PageSize).Find(&books).Error; err != nil {
		return nil, 0, err
	}

	return books, total, nil
}

func GetBookByID(id uint) (*Book, error) {
	var book Book
	err := db.Preload("Category").First(&book, id).Error
	if err != nil {
		return nil, err
	}
	return &book, nil
}

func CreateBook(book *Book) error {
	return db.Create(book).Error
}

func UpdateBook(book *Book) error {
	return db.Save(book).Error
}

func DeleteBook(id uint) error {
	return db.Delete(&Book{}, id).Error
}

func UpdateBookStatus(id uint, status int) error {
	return db.Model(&Book{}).Where("id = ?", id).Update("status", status).Error
}

func UpdateStock(bookID uint, delta int) error {
	return db.Model(&Book{}).Where("id = ? AND stock + ? >= 0", bookID, delta).
		Update("stock", gorm.Expr("stock + ?", delta)).Error
}
