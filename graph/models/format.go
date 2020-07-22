package models

import (
	"time"
)

// Format model
type Format struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description *string   `json:"description"`
	SpaceID     int       `json:"space_id"`
}

// FormatsPaging model
type FormatsPaging struct {
	Nodes []*Format `json:"nodes"`
	Total int       `json:"total"`
}
