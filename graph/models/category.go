package models

import (
	"time"
)

// Category model
type Category struct {
	ID          int       `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description *string   `json:"description"`
	ParentID    int       `json:"parent_id"`
	MediumID    *int      `json:"medium_id"`
	SpaceID     int       `json:"space_id"`
}

// CategoriesPaging model
type CategoriesPaging struct {
	Nodes []*Category `json:"nodes"`
	Total int         `json:"total"`
}
