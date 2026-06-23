package models

type OrderItem struct {
	ID       uint    `gorm:"primaryKey" json:"id"`
	OrderID  uint    `gorm:"index;not null" json:"order_id"`
	BookID   uint    `gorm:"not null" json:"book_id"`
	Quantity int     `gorm:"not null" json:"quantity"`
	Price    float64 `gorm:"type:decimal(10,2);not null" json:"price"`
	Book     Book    `gorm:"foreignKey:BookID" json:"book,omitempty"`
}

func CreateOrderItem(item *OrderItem) error {
	return db.Create(item).Error
}

func GetOrderItemsByOrderID(orderID uint) ([]OrderItem, error) {
	var items []OrderItem
	err := db.Where("order_id = ?", orderID).Preload("Book").Find(&items).Error
	return items, err
}

func BatchCreateOrderItems(items []OrderItem) error {
	if len(items) == 0 {
		return nil
	}
	return db.Create(&items).Error
}
