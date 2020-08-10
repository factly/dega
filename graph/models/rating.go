package models

import (
	"time"
)

// Rating model
type Rating struct {
	ID           int       `json:"id"`
	CreatedDate  time.Time `json:"created_date"`
	UpdatedDate  time.Time `json:"updated_date"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	Description  *string   `json:"description"`
	NumericValue int       `json:"numeric_value"`
	MediumID     *int      `json:"medium_id"`
	SpaceID      int       `json:"space_id"`
}

// RatingsPaging model
type RatingsPaging struct {
	Nodes []*Rating `json:"nodes"`
	Total int       `json:"total"`
}
