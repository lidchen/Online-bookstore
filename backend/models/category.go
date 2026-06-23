package models

type Category struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `gorm:"size:50;not null" json:"name"`
}

func GetAllCategories() ([]Category, error) {
	var categories []Category
	err := db.Find(&categories).Error
	return categories, err
}

func GetCategoryByID(id uint) (*Category, error) {
	var category Category
	err := db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}
