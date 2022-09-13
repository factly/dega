package model

import (
	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type SpaceRole struct {
	config.Base
	Name        string `json:"name"`
	Description string `json:"description"`
	Slug        string `json:"slug"`
	SpaceID     uint   `json:"space_id"`
	Users       []User `json:"users"`
}

type User struct {
	config.Base
	Email            string         `json:"email"`
	KID              string         `json:"kid"`
	FirstName        string         `json:"first_name"`
	LastName         string         `json:"last_name"`
	Slug             string         `json:"slug"`
	DisplayName      string         `json:"display_name"`
	Gender           string         `json:"gender"`
	FeaturedMediumID *uint          `json:"featured_medium_id"`
	Medium           *Medium        `json:"medium"`
	SocialMediaURLs  postgres.Jsonb `json:"social_media_urls" swaggertype:"primitive,string"`
	Description      string         `json:"description"`
	Meta             postgres.Jsonb `json:"meta"`
}
