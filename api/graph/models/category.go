package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Category model
type Category struct {
	ID               uuid.UUID       `gorm:"primary_key" json:"id"`
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name             string          `gorm:"column:name" json:"name"`
	Slug             string          `gorm:"column:slug" json:"slug"`
	Description      postgres.Jsonb  `gorm:"column:description" json:"description"`
	BackgroundColour postgres.Jsonb  `gorm:"column:background_colour" json:"background_colour"`
	DescriptionHTML  string          `gorm:"column:description_html" json:"description_html"`
	Medium           *Medium         `json:"medium"`
	ParentID         uuid.UUID       `gorm:"column:parent_id" json:"parent_id" sql:"DEFAULT:NULL"`
	MediumID         uuid.UUID       `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	SpaceID          uuid.UUID       `gorm:"column:space_id" json:"space_id"`
	MetaFields       postgres.Jsonb  `gorm:"column:meta_fields" json:"meta_fields"`
	Meta             postgres.Jsonb  `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string          `gorm:"column:header_code" json:"header_code"`
	FooterCode       string          `gorm:"column:footer_code" json:"footer_code"`
	IsFeatured       bool            `gorm:"column:is_featured" json:"is_featured"`
}

// CategoriesPaging model
type CategoriesPaging struct {
	Nodes []*Category `json:"nodes"`
	Total int         `json:"total"`
}
