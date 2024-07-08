package model

import (
	"errors"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Rating model
type Rating struct {
	config.Base
	Name             string         `gorm:"column:name" json:"name"`
	Slug             string         `gorm:"column:slug" json:"slug"`
	BackgroundColour postgres.Jsonb `gorm:"column:background_colour" json:"background_colour" swaggertype:"primitive,string"`
	TextColour       postgres.Jsonb `gorm:"column:text_colour" json:"text_colour" swaggertype:"primitive,string"`
	Description      postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	DescriptionHTML  string         `gorm:"column:description_html" json:"description_html,omitempty"`
	NumericValue     int            `gorm:"column:numeric_value" json:"numeric_value"`
	MediumID         *uuid.UUID     `gorm:"type:uuid;column:medium_id;default=NULL" json:"medium_id"`
	Medium           *model.Medium  `gorm:"foreignKey:medium_id" json:"medium"`
	MetaFields       postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	SpaceID          uuid.UUID      `gorm:"type:uuid;column:space_id" json:"space_id"`
	Meta             postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `gorm:"column:header_code" json:"header_code"`
	FooterCode       string         `gorm:"column:footer_code" json:"footer_code"`
}

// BeforeSave - validation for medium
func (rating *Rating) BeforeSave(tx *gorm.DB) (e error) {

	if rating.MediumID != nil && *rating.MediumID != uuid.Nil {
		medium := model.Medium{}
		medium.ID = *rating.MediumID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: rating.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium does not belong to same space")
		}
	}
	return nil
}

// BeforeCreate hook
func (rating *Rating) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(config.UserContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	rating.CreatedByID = uID
	rating.UpdatedByID = uID
	rating.ID = uuid.New()
	return nil
}
