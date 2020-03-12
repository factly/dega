package models

import (
	"time"
)

// Claim model
type Claim struct {
	ID              string       `bson:"_id"`
	Claim           string       `bson:"claim"`
	Description     string       `bson:"description"`
	ClaimDate       time.Time    `bson:"claim_date"`
	ClaimSource     string       `bson:"claim_source"`
	CheckedDate     time.Time    `bson:"checked_date"`
	ReviewSources   string       `bson:"review_sources"`
	Review          string       `bson:"review"`
	ReviewTagLine   *string      `bson:"review_tag_line"`
	ClientID        string       `bson:"client_id"`
	Slug            string       `bson:"slug"`
	CreatedDate     time.Time    `bson:"created_date"`
	LastUpdatedDate time.Time    `bson:"last_updated_date"`
	Rating          *DatabaseRef `bson:"rating"`
	Claimant        *DatabaseRef `bson:"claimant"`
	Class           string       `bson:"_class"`
}

// ClaimsPaging model
type ClaimsPaging struct {
	Nodes []*Claim `json:"nodes"`
	Total int      `json:"total"`
}
