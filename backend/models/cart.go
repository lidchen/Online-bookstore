package models

type Cart struct {
	ID       uint `gorm:"primaryKey" json:"id"`
	UserID   uint `gorm:"uniqueIndex:idx_user_book;not null" json:"user_id"`
	BookID   uint `gorm:"uniqueIndex:idx_user_book;not null" json:"book_id"`
	Quantity int  `gorm:"not null;default:1" json:"quantity"`
	Book     Book `gorm:"foreignKey:BookID" json:"book"`
}

func GetCartByUserID(userID uint) ([]Cart, error) {
	var items []Cart
	err := db.Where("user_id = ?", userID).Preload("Book").Find(&items).Error
	return items, err
}

func GetCartItem(userID uint, bookID uint) (*Cart, error) {
	var item Cart
	err := db.Where("user_id = ? AND book_id = ?", userID, bookID).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func AddToCart(userID uint, bookID uint, quantity int) error {
	var existing Cart
	err := db.Where("user_id = ? AND book_id = ?", userID, bookID).First(&existing).Error
	if err == nil {
		return db.Model(&existing).Update("quantity", existing.Quantity+quantity).Error
	}
	item := Cart{
		UserID:   userID,
		BookID:   bookID,
		Quantity: quantity,
	}
	return db.Create(&item).Error
}

func UpdateCartQuantity(userID uint, bookID uint, quantity int) error {
	return db.Model(&Cart{}).Where("user_id = ? AND book_id = ?", userID, bookID).
		Update("quantity", quantity).Error
}

func RemoveFromCart(userID uint, bookID uint) error {
	return db.Where("user_id = ? AND book_id = ?", userID, bookID).Delete(&Cart{}).Error
}

func ClearCart(userID uint) error {
	return db.Where("user_id = ?", userID).Delete(&Cart{}).Error
}
