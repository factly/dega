package models

import (
	"time"
)

// Claimant model
type Claimant struct {
	ID          int       `json:"id"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	TagLine     string    `json:"tag_line"`
	MediumID    *int      `json:"medium_id"`
	SpaceID     int       `json:"space_id"`
}

// ClaimantsPaging model
type ClaimantsPaging struct {
	Nodes []*Claimant `json:"nodes"`
	Total int         `json:"total"`
}
