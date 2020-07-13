package model

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Claim model
type Claim struct {
	config.Base
	Title         string         `gorm:"column:title" json:"title"`
	Slug          string         `gorm:"column:slug" json:"slug"`
	ClaimDate     *time.Time     `gorm:"column:claim_date" json:"claim_date" sql:"DEFAULT:NULL"`
	CheckedDate   *time.Time     `gorm:"column:checked_date" json:"checked_date" sql:"DEFAULT:NULL"`
	ClaimSources  string         `gorm:"column:claim_sources" json:"claim_sources"`
	Description   postgres.Jsonb `gorm:"column:description" json:"description"`
	ClaimantID    uint           `gorm:"column:claimant_id" json:"claimant_id"`
	Claimant      Claimant       `gorm:"foreignkey:claimant_id;association_foreignkey:id" json:"claimant"`
	RatingID      uint           `gorm:"column:rating_id" json:"rating_id"`
	Rating        Rating         `gorm:"foreignkey:rating_id;association_foreignkey:id" json:"rating"`
	Review        string         `gorm:"column:review" json:"review"`
	ReviewTagLine string         `gorm:"column:review_tag_line" json:"review_tag_line"`
	ReviewSources string         `gorm:"column:review_sources" json:"review_sources"`
	SpaceID       uint           `gorm:"column:space_id" json:"space_id"`
}

// PostClaim model
type PostClaim struct {
	config.Base
	ClaimID uint  `gorm:"column:claim_id" json:"claim_id"`
	Claim   Claim `gorm:"foreignkey:claim_id;association_foreignkey:id"`
	PostID  uint  `gorm:"column:post_id" json:"post_id"`
}

// BeforeCreate - validation for rating & claimant
func (c *Claim) BeforeCreate(tx *gorm.DB) (e error) {
	if c.ClaimantID > 0 {
		claimant := Claimant{}
		claimant.ID = c.ClaimantID

		err := tx.Model(&Claimant{}).Where(Claimant{
			SpaceID: c.SpaceID,
		}).First(&claimant).Error

		if err != nil {
			return err
		}
	}

	if c.RatingID > 0 {
		rating := Rating{}
		rating.ID = c.RatingID

		err := tx.Model(&Rating{}).Where(Rating{
			SpaceID: c.SpaceID,
		}).First(&rating).Error

		if err != nil {
			return err
		}
	}

	return nil
}
