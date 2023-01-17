package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Rating model
type Rating struct {
	ID               uint            `gorm:"primary_key" json:"id"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name             string          `gorm:"column:name" json:"name"`
	Slug             string          `gorm:"column:slug" json:"slug"`
	Description      postgres.Jsonb  `gorm:"column:description" json:"description"`
	BackgroundColour postgres.Jsonb  `gorm:"column:background_colour" json:"background_colour" swaggertype:"primitive,string"`
	TextColour       postgres.Jsonb  `gorm:"column:text_colour" json:"text_colour" swaggertype:"primitive,string"`
	DescriptionHTML  string          `gorm:"column:description_html" json:"description_html"`
	NumericValue     int             `gorm:"column:numeric_value" json:"numeric_value"`
	MediumID         uint            `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	Medium           *Medium         `gorm:"foreignKey:medium_id" json:"medium"`
	MetaFields       postgres.Jsonb  `gorm:"column:meta_fields" json:"meta_fields"`
	Meta             postgres.Jsonb  `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string          `gorm:"column:header_code" json:"header_code"`
	FooterCode       string          `gorm:"column:footer_code" json:"footer_code"`
	SpaceID          uint            `gorm:"column:space_id" json:"space_id"`
}

// RatingsPaging model
type RatingsPaging struct {
	Nodes []*Rating `json:"nodes"`
	Total int       `json:"total"`
}
