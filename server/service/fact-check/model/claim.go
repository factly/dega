package model

import (
	"errors"
	"time"

	"github.com/factly/dega-server/service/core/model"
	"github.com/google/uuid"

	"gorm.io/gorm"

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
	MigrationID     *uuid.UUID     `gorm:"type:uuid;column:migration_id;default:NULL;" json:"migration_id"`
	MigratedHTML    string         `gorm:"column:migrated_html" json:"migrated_html"`
	ClaimantID      uuid.UUID      `gorm:"type:uuid;column:claimant_id" json:"claimant_id"`
	Claimant        Claimant       `gorm:"foreignKey:claimant_id" json:"claimant"`
	RatingID        uuid.UUID      `gorm:"type:uuid;column:rating_id" json:"rating_id"`
	Rating          Rating         `gorm:"foreignKey:rating_id" json:"rating"`
	MediumID        *uuid.UUID     `gorm:"type:uuid;column:medium_id;default:NULL" json:"medium_id"`
	Medium          *model.Medium  `gorm:"foreignKey:medium_id" json:"medium"`
	Fact            string         `gorm:"column:fact" json:"fact"`
	ReviewSources   postgres.Jsonb `gorm:"column:review_sources" json:"review_sources" swaggertype:"primitive,string"`
	MetaFields      postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	SpaceID         uuid.UUID      `gorm:"type:uuid;column:space_id" json:"space_id"`
	VideoID         *uuid.UUID     `gorm:"type:uuid;column:video_id" json:"video_id"`
	Video           *Video         `gorm:"foreignKey:video_id" json:"video"`
	EndTime         int            `gorm:"column:end_time" json:"end_time"`
	StartTime       int            `gorm:"column:start_time" json:"start_time"`
	Meta            postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode      string         `gorm:"column:header_code" json:"header_code"`
	FooterCode      string         `gorm:"column:footer_code" json:"footer_code"`
}

// PostClaim model
type PostClaim struct {
	config.Base
	ClaimID  uuid.UUID `gorm:"type:uuid;column:claim_id" json:"claim_id"`
	Claim    Claim     `gorm:"foreignKey:claim_id" json:"claim"`
	PostID   uuid.UUID `gorm:"type:uuid;column:post_id" json:"post_id"`
	Position int       `gorm:"type:uuid;column:position" json:"position"`
}

// BeforeSave - validation for rating & claimant
func (claim *Claim) BeforeSave(tx *gorm.DB) (e error) {
	if claim.ClaimantID != uuid.Nil {
		claimant := Claimant{}
		claimant.ID = claim.ClaimantID

		err := tx.Model(&Claimant{}).Where(Claimant{
			SpaceID: claim.SpaceID,
		}).First(&claimant).Error

		if err != nil {
			return errors.New("claimant do not belong to same space")
		}
	}

	if claim.RatingID != uuid.Nil {
		rating := Rating{}
		rating.ID = claim.RatingID

		err := tx.Model(&Rating{}).Where(Rating{
			SpaceID: claim.SpaceID,
		}).First(&rating).Error

		if err != nil {
			return errors.New("rating do not belong to same space")
		}
	}

	return nil
}

// BeforeCreate hook
func (claim *Claim) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(config.UserContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	claim.CreatedByID = uID
	claim.UpdatedByID = uID
	claim.ID = uuid.New()
	return nil
}

// BeforeCreate hook
func (pc *PostClaim) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(config.UserContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	pc.CreatedByID = uID
	pc.UpdatedByID = uID
	pc.ID = uuid.New()
	return nil
}
