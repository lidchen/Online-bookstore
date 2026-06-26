package models

import (
	"fmt"
	"gorm.io/gorm"
	"math/rand"
	"time"
)

const (
	OrderStatusPending   = 0
	OrderStatusPaid      = 1
	OrderStatusCompleted = 2
	OrderStatusCancelled = 3
)

var OrderStatusText = map[int]string{
	OrderStatusPending:   "待支付",
	OrderStatusPaid:      "待发货",
	OrderStatusCompleted: "已完成",
	OrderStatusCancelled: "已取消",
}

type Order struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index;not null" json:"user_id"`
	Username    string    `gorm:"-" json:"username,omitempty"`
	OrderNo     string    `gorm:"uniqueIndex;size:32;not null" json:"order_no"`
	TotalAmount float64   `gorm:"type:decimal(10,2);not null" json:"total_amount"`
	Address     string    `gorm:"size:200;not null" json:"address"`
	Phone       string    `gorm:"size:20;not null" json:"phone"`
	Status      int       `gorm:"default:0;index" json:"status"`
	StatusText  string    `gorm:"-" json:"status_text"`
	CreatedAt   time.Time `json:"created_at"`
	Items       []OrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
}

func GenerateOrderNo() string {
	now := time.Now()
	prefix := now.Format("20060102150405")
	random := rand.Intn(1000000)
	return fmt.Sprintf("%s%06d", prefix, random)
}

func CreateOrder(order *Order) error {
	return db.Create(order).Error
}

func GetOrdersByUserID(userID uint) ([]Order, error) {
	var orders []Order
	err := db.Where("user_id = ?", userID).Preload("Items").Preload("Items.Book", func(db *gorm.DB) *gorm.DB {
		return db.Unscoped()
	}).
		Order("created_at DESC").Find(&orders).Error
	for i := range orders {
		orders[i].StatusText = OrderStatusText[orders[i].Status]
	}
	return orders, err
}

func GetOrderByID(id uint) (*Order, error) {
	var order Order
	err := db.Preload("Items").Preload("Items.Book", func(db *gorm.DB) *gorm.DB {
		return db.Unscoped()
	}).First(&order, id).Error
	if err != nil {
		return nil, err
	}
	order.StatusText = OrderStatusText[order.Status]
	return &order, nil
}

func UpdateOrderStatus(id uint, status int) error {
	return db.Model(&Order{}).Where("id = ?", id).Update("status", status).Error
}

func GetAllOrders(query OrderListQuery) ([]Order, int64, error) {
	var orders []Order
	var total int64

	q := db.Model(&Order{})

	if query.Status != nil {
		q = q.Where("status = ?", *query.Status)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (query.Page - 1) * query.PageSize
	if err := q.Order("created_at DESC").Offset(offset).Limit(query.PageSize).
		Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	for i := range orders {
		orders[i].StatusText = OrderStatusText[orders[i].Status]
		var user User
		if err := db.First(&user, orders[i].UserID).Error; err == nil {
			orders[i].Username = user.Username
		}
	}

	return orders, total, nil
}

type OrderListQuery struct {
	Page     int
	PageSize int
	Status   *int
}
