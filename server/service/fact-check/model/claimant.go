package model

import (
	"errors"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Claimant model
type Claimant struct {
	config.Base
	Name            string         `gorm:"column:name" json:"name"`
	Slug            string         `gorm:"column:slug" json:"slug"`
	Description     postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	DescriptionHTML string         `gorm:"column:description_html" json:"description_html,omitempty"`
	IsFeatured      bool           `gorm:"column:is_featured" json:"is_featured"`
	TagLine         string         `gorm:"column:tag_line" json:"tag_line"`
	MediumID        *uuid.UUID     `gorm:"type:uuid;column:medium_id;default:NULL" json:"medium_id"`
	Medium          *model.Medium  `gorm:"foreignKey:medium_id" json:"medium"`
	MetaFields      postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	SpaceID         uuid.UUID      `gorm:"type:uuid;column:space_id" json:"space_id"`
	Meta            postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode      string         `gorm:"column:header_code" json:"header_code"`
	FooterCode      string         `gorm:"column:footer_code" json:"footer_code"`
}

// BeforeSave - validation for medium
func (claimant *Claimant) BeforeSave(tx *gorm.DB) (e error) {
	if claimant.MediumID != nil && *claimant.MediumID != uuid.Nil {
		medium := model.Medium{}
		medium.ID = *claimant.MediumID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: claimant.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	return nil
}

// BeforeCreate hook
func (claimant *Claimant) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(config.UserContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	claimant.CreatedByID = uID
	claimant.UpdatedByID = uID
	claimant.ID = uuid.New()
	return nil
}
