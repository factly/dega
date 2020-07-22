package models

import (
	"time"
)

// Claimant model
type Claimant struct {
	ID          int       `json:"id"`
	CreatedDate time.Time `json:"created_date"`
	UpdatedDate time.Time `json:"updated_date"`
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
