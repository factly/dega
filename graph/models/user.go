package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// User model
type User struct {
	ID               uint           `gorm:"primary_key" json:"id"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Slug             string         `gorm:"column:slug" json:"slug"`
	Email            string         `gorm:"column:email;unique_index" json:"email"`
	FirstName        string         `gorm:"column:first_name" json:"first_name"`
	LastName         string         `gorm:"column:last_name" json:"last_name"`
	DisplayName      string         `gorm:"column:display_name" json:"display_name"`
	BirthDate        string         `gorm:"column:birth_date" json:"birth_date"`
	Gender           string         `gorm:"column:gender" json:"gender"`
	SocialMediaURLs  postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls"`
	Description      string         `gorm:"column:description" json:"description"`
	FeaturedMediumID uint           `gorm:"column:featured_medium_id" json:"featured_medium_id" sql:"DEFAULT:NULL"`
}

// UsersPaging model
type UsersPaging struct {
	Nodes []*User `json:"nodes"`
	Total int     `json:"total"`
}
