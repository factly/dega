package model

import (
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Author model
type Author struct {
	ID               string         `gorm:"primary_key" json:"id"`
	Email            string         `gorm:"column:email;uniqueIndex" json:"email"`
	KID              string         `gorm:"column:kid;" json:"kid"`
	FirstName        string         `gorm:"column:first_name" json:"first_name"`
	LastName         string         `gorm:"column:last_name" json:"last_name"`
	Slug             string         `gorm:"column:slug" json:"slug"`
	DisplayName      string         `gorm:"column:display_name" json:"display_name"`
	BirthDate        string         `gorm:"column:birth_date" json:"birth_date"`
	Gender           string         `gorm:"column:gender" json:"gender"`
	FeaturedMediumID *uuid.UUID     `gorm:"column:featured_medium_id;default:NULL" json:"featured_medium_id"`
	Medium           *Medium        `gorm:"foreignKey:featured_medium_id" json:"medium"`
	SocialMediaURLs  postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls" swaggertype:"primitive,string"`
	Description      string         `gorm:"column:description" json:"description"`
}
