package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Tag model
type Tag struct {
	ID               uint            `gorm:"primary_key" json:"id"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name             string          `gorm:"column:name" json:"name" validate:"required"`
	Slug             string          `gorm:"column:slug" json:"slug" validate:"required"`
	Description      string          `gorm:"column:description" json:"description"`
	BackgroundColour postgres.Jsonb  `gorm:"column:background_colour" json:"background_colour"`
	DescriptionHTML  string          `gorm:"column:description_html" json:"description_html"`
	MetaFields       postgres.Jsonb  `gorm:"column:meta_fields" json:"meta_fields"`
	Meta             postgres.Jsonb  `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string          `gorm:"column:header_code" json:"header_code"`
	FooterCode       string          `gorm:"column:footer_code" json:"footer_code"`
	SpaceID          uint            `gorm:"column:space_id" json:"space_id"`
	MediumID         uint            `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	Medium           *Medium         `json:"medium"`
	IsFeatured       bool            `gorm:"column:is_featured" json:"is_featured"`
}

// TagsPaging model
type TagsPaging struct {
	Nodes []*Tag `json:"nodes"`
	Total int    `json:"total"`
}
