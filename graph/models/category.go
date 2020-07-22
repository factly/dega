package models

import (
	"time"
)

// Category model
type Category struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
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
