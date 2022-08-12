package model

import (
	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type SpaceRole struct {
	config.Base
	Name        string `gorm:"column:name" json:"name"`
	Description string `gorm:"column:description" json:"description"`
	Slug        string `gorm:"column:slug" json:"slug"`
	SpaceID     uint   `gorm:"column:space_id" json:"space_id"`
	Space       *Space `gorm:"foreignKey:space_id" json:"space,omitempty"`
	Users       []User `gorm:"many2many:space_roles_users;" json:"users"`
}

type User struct {
	config.Base
	Email            string         `gorm:"column:email;uniqueIndex" json:"email"`
	KID              string         `gorm:"column:kid;" json:"kid"`
	FirstName        string         `gorm:"column:first_name" json:"first_name"`
	LastName         string         `gorm:"column:last_name" json:"last_name"`
	Slug             string         `gorm:"column:slug" json:"slug"`
	DisplayName      string         `gorm:"column:display_name" json:"display_name"`
	Gender           string         `gorm:"column:gender" json:"gender"`
	FeaturedMediumID *uint          `gorm:"column:featured_medium_id;default:NULL" json:"featured_medium_id"`
	Medium           *Medium        `gorm:"foreignKey:featured_medium_id" json:"medium"`
	SocialMediaURLs  postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls" swaggertype:"primitive,string"`
	Description      string         `gorm:"column:description" json:"description"`
	Meta             postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	Organisations    []Organisation `gorm:"many2many:organisation_users;" json:"organisations"`
}
