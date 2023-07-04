package model

import (
	"time"

	"github.com/factly/dega-server/service/core/model"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Claim model
type Claim struct {
	config.Base
	Claim           string         `gorm:"column:claim" json:"claim"`
	Slug            string         `gorm:"column:slug" json:"slug"`
	ClaimDate       *time.Time     `gorm:"column:claim_date" json:"claim_date" sql:"DEFAULT:NULL"`
	CheckedDate     *time.Time     `gorm:"column:checked_date" json:"checked_date" sql:"DEFAULT:NULL"`
	ClaimSources    postgres.Jsonb `gorm:"column:claim_sources" json:"claim_sources" swaggertype:"primitive,string"`
	Description     postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	DescriptionHTML string         `gorm:"column:description_html" json:"description_html,omitempty"`
	DescriptionAMP  string         `gorm:"column:description_amp" json:"description_amp"`
	MigrationID     *uint          `gorm:"column:migration_id;default:NULL;" json:"migration_id"`
	MigratedHTML    string         `gorm:"column:migrated_html" json:"migrated_html"`
	ClaimantID      uint           `gorm:"column:claimant_id" json:"claimant_id"`
	Claimant        Claimant       `json:"claimant"`
	RatingID        uint           `gorm:"column:rating_id" json:"rating_id"`
	Rating          Rating         `json:"rating"`
	MediumID        *uint          `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium          *model.Medium  `json:"medium"`
	Fact            string         `gorm:"column:fact" json:"fact"`
	ReviewSources   postgres.Jsonb `gorm:"column:review_sources" json:"review_sources" swaggertype:"primitive,string"`
	MetaFields      postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	SpaceID         uint           `gorm:"column:space_id" json:"space_id"`
	EndTime         int            `gorm:"column:end_time" json:"end_time"`
	StartTime       int            `gorm:"column:start_time" json:"start_time"`
	Meta            postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode      string         `gorm:"column:header_code" json:"header_code"`
	FooterCode      string         `gorm:"column:footer_code" json:"footer_code"`
}

// PostClaim model
type PostClaim struct {
	config.Base
	ClaimID  uint  `gorm:"column:claim_id" json:"claim_id"`
	Claim    Claim `json:"claim"`
	PostID   uint  `gorm:"column:post_id" json:"post_id"`
	Position uint  `gorm:"column:position" json:"position"`
}
