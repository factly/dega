package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Claimant model
type Claimant struct {
	ID              uint            `gorm:"primary_key" json:"id"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	DeletedAt       *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name            string          `gorm:"column:name" json:"name"`
	Slug            string          `gorm:"column:slug" json:"slug"`
	Description     postgres.Jsonb  `gorm:"column:description" json:"description"`
	DescriptionHTML string          `gorm:"column:description_html" json:"description_html"`
	TagLine         string          `gorm:"column:tag_line" json:"tag_line"`
	MediumID        uint            `gorm:"column:medium_id" json:"medium_id" sql:"DEFAULT:NULL"`
	Medium          *Medium         `gorm:"foreignKey:medium_id" json:"medium"`
	MetaFields      postgres.Jsonb  `gorm:"column:meta_fields" json:"meta_fields"`
	Meta            postgres.Jsonb  `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode      string          `gorm:"column:header_code" json:"header_code"`
	FooterCode      string          `gorm:"column:footer_code" json:"footer_code"`
	SpaceID         uint            `gorm:"column:space_id" json:"space_id"`
}

// ClaimantsPaging model
type ClaimantsPaging struct {
	Nodes []*Claimant `json:"nodes"`
	Total int         `json:"total"`
}
