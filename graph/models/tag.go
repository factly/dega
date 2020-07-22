package models

import (
	"time"
)

// Tag model
type Tag struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description *string   `json:"description"`
	SpaceID     int       `json:"space_id"`
}

// TagsPaging model
type TagsPaging struct {
	Nodes []*Tag `json:"nodes"`
	Total int    `json:"total"`
}
