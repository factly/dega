package model

import "github.com/jinzhu/gorm/dialects/postgres"

// Author model
type Author struct {
	Base
	Email           string         `gorm:"column:email;unique_index" json:"email"`
	FirstName       string         `gorm:"column:first_name" json:"first_name"`
	LastName        string         `gorm:"column:last_name" json:"last_name"`
	BirthDate       string         `gorm:"column:birth_date" json:"birth_date"`
	Slug            string         `gorm:"column:slug" json:"slug"`
	DisplayName     string         `gorm:"column:display_name" json:"display_name"`
	Gender          string         `gorm:"column:gender" json:"gender"`
	Medium          *Medium        `gorm:"foreignKey:featured_medium_id" json:"medium"`
	SocialMediaURLs postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls" swaggertype:"primitive,string"`
	Description     string         `gorm:"column:description" json:"description"`
}
