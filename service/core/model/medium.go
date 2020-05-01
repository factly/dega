package model

import (
	"github.com/jinzhu/gorm"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Medium model
type Medium struct {
	gorm.Model
	Name        string         `gorm:"column:name" json:"name"`
	Slug        string         `gorm:"column:slug" json:"slug"`
	Type        string         `gorm:"column:type" json:"type"`
	Title       string         `gorm:"column:title" json:"title"`
	Description string         `gorm:"column:description" json:"description"`
	Caption     string         `gorm:"column:caption" json:"caption"`
	AltText     string         `gorm:"column:alt_text" json:"alt_text"`
	FileSize    int64          `gorm:"column:file_size" json:"file_size"`
	URL         postgres.Jsonb `gorm:"column:url" json:"url"`
	Dimensions  string         `gorm:"column:dimensions" json:"dimensions"`
}
