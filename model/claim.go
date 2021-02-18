package model

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Claim model
type Claim struct {
	Base
	Title         string         `gorm:"column:title" json:"title"`
	Slug          string         `gorm:"column:slug" json:"slug"`
	ClaimDate     time.Time      `gorm:"column:claim_date" json:"claim_date" sql:"DEFAULT:NULL"`
	CheckedDate   time.Time      `gorm:"column:checked_date" json:"checked_date" sql:"DEFAULT:NULL"`
	ClaimSources  postgres.Jsonb `gorm:"column:claim_sources" json:"claim_sources" swaggertype:"primitive,string"`
	Description   postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	ClaimantID    uint           `gorm:"column:claimant_id" json:"claimant_id"`
	Claimant      Claimant       `json:"claimant"`
	RatingID      uint           `gorm:"column:rating_id" json:"rating_id"`
	Rating        Rating         `json:"rating"`
	Review        postgres.Jsonb `gorm:"column:review" json:"review" swaggertype:"primitive,string"`
	ReviewTagLine postgres.Jsonb `gorm:"column:review_tag_line" json:"review_tag_line" swaggertype:"primitive,string"`
	ReviewSources postgres.Jsonb `gorm:"column:review_sources" json:"review_sources" swaggertype:"primitive,string"`
	SpaceID       uint           `gorm:"column:space_id" json:"space_id"`
}

// PostClaim model
type PostClaim struct {
	Base
	ClaimID uint  `gorm:"column:claim_id" json:"claim_id"`
	Claim   Claim `json:"claim"`
	PostID  uint  `gorm:"column:post_id" json:"post_id"`
}
