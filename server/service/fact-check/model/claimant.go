package model

import (
	"errors"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Claimant model
type Claimant struct {
	config.Base
	Name            string         `gorm:"column:name" json:"name"`
	Slug            string         `gorm:"column:slug" json:"slug"`
	Description     postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	HTMLDescription string         `gorm:"column:html_description" json:"html_description,omitempty"`
	TagLine         string         `gorm:"column:tag_line" json:"tag_line"`
	MediumID        *uint          `gorm:"column:medium_id;type:INT4;default:NULL" json:"medium_id"`
	Medium          *model.Medium  `json:"medium"`
	MetaFields      postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	SpaceID         uint           `gorm:"column:space_id" json:"space_id"`
	Space           *model.Space   `json:"space,omitempty"`
	Meta            postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode      string         `gorm:"column:header_code" json:"header_code"`
	FooterCode      string         `gorm:"column:footer_code" json:"footer_code"`
}

// BeforeSave - validation for medium
func (claimant *Claimant) BeforeSave(tx *gorm.DB) (e error) {
	if claimant.MediumID != nil && *claimant.MediumID > 0 {
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

var claimantUser config.ContextKey = "claimant_user"

// BeforeCreate hook
func (claimant *Claimant) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(claimantUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	claimant.CreatedByID = uint(uID)
	claimant.UpdatedByID = uint(uID)
	return nil
}
