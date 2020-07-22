package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Claim model
type Claim struct {
	ID            int            `json:"id"`
	CreatedDate   time.Time      `json:"created_date"`
	UpdatedDate   time.Time      `json:"updated_date"`
	Title         string         `json:"title"`
	Slug          string         `json:"slug"`
	ClaimDate     *time.Time     `json:"claim_date"`
	CheckedDate   *time.Time     `json:"checked_date"`
	ClaimSource   string         `json:"claim_source"`
	Description   postgres.Jsonb `json:"description"`
	Review        string         `json:"review"`
	ReviewTagLine *string        `json:"review_tag_line"`
	ReviewSources string         `json:"review_sources"`
	SpaceID       int            `json:"space_id"`
	RatingID      int            `json:"rating_id"`
	ClaimantID    int            `json:"claimant_id"`
}

// ClaimsPaging model
type ClaimsPaging struct {
	Nodes []*Claim `json:"nodes"`
	Total int      `json:"total"`
}
