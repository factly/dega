package space

import (
	"github.com/factly/dega-server/config"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// space request body
type space struct {
	Name              string         `json:"name" validate:"required,min=3,max=50"`
	Slug              string         `json:"slug"`
	SiteTitle         string         `json:"site_title"`
	TagLine           string         `json:"tag_line"`
	Description       string         `json:"description"`
	SiteAddress       string         `json:"site_address"`
	LogoID            uint           `json:"logo_id"`
	LogoMobileID      uint           `json:"logo_mobile_id"`
	FavIconID         uint           `json:"fav_icon_id"`
	MobileIconID      uint           `json:"mobile_icon_id"`
	VerificationCodes postgres.Jsonb `json:"verification_codes" swaggertype:"primitive,string"`
	SocialMediaURLs   postgres.Jsonb `json:"social_media_urls" swaggertype:"primitive,string"`
	ContactInfo       postgres.Jsonb `json:"contact_info" swaggertype:"primitive,string"`
	Analytics         postgres.Jsonb `json:"analytics" swaggertype:"primitive,string"`
	OrganisationID    int            `json:"organisation_id" validate:"required"`
}

var userContext config.ContextKey = "space_user"

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", my)
	r.Route("/{space_id}", func(r chi.Router) {
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}
