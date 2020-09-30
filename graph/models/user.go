package models

import "time"

// User model
type User struct {
	ID        uint      `gorm:"primary_key" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Email     string    `gorm:"column:email;unique_index" json:"email"`
	FirstName string    `gorm:"column:first_name" json:"first_name"`
	LastName  string    `gorm:"column:last_name" json:"last_name"`
	BirthDate string    `gorm:"column:birth_date" json:"birth_date"`
	Gender    string    `gorm:"column:gender" json:"gender"`
}

// UsersPaging model
type UsersPaging struct {
	Nodes []*User `json:"nodes"`
	Total int     `json:"total"`
}
