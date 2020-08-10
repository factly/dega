package models

import "time"

// User model
type User struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
	FirstName   string    `json:"first_name"`
	LastName    *string   `json:"last_name"`
	Email       string    `json:"email"`
	BirthDate   *string   `json:"birth_date"`
	Gender      *string   `json:"gender"`
}

// UsersPaging model
type UsersPaging struct {
	Nodes []*User `json:"nodes"`
	Total int     `json:"total"`
}
