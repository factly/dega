package model

import (
	"github.com/factly/dega-server/config"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Tag model
type Tag struct {
	config.Base
	Name             string         `gorm:"column:name" json:"name" validate:"required"`
	Slug             string         `gorm:"column:slug" json:"slug" validate:"required"`
	BackgroundColour postgres.Jsonb `json:"background_colour" validate:"required" swaggertype:"primitive,string"`
	Description      postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	DescriptionHTML  string         `gorm:"column:description_html" json:"description_html,omitempty"`
	IsFeatured       bool           `gorm:"column:is_featured" json:"is_featured"`
	MetaFields       postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	MediumID         *uuid.UUID     `gorm:"type:uuid;column:medium_id;default:NULL" json:"medium_id"`
	Medium           *Medium        `gorm:"foreignKey:medium_id" json:"medium"`
	SpaceID          uuid.UUID      `gorm:"type:uuid;column:space_id" json:"space_id"`
	Posts            []*Post        `gorm:"many2many:post_tags;" json:"posts"`
	Meta             postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `gorm:"column:header_code" json:"header_code"`
	FooterCode       string         `gorm:"column:footer_code" json:"footer_code"`
}

var tagUser config.ContextKey = "tag_user"

// BeforeCreate hook
func (tag *Tag) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(tagUser)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	tag.CreatedByID = uID
	tag.UpdatedByID = uID
	tag.ID = uuid.New()
	return nil
}
