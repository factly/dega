package space

import (
	"github.com/factly/dega-server/service/core/action/space/tokens"
	"github.com/factly/dega-server/service/core/action/space/users"
	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type space struct {
	Name              string         `json:"name" validate:"required,min=3,max=50"`
	Slug              string         `json:"slug"`
	SiteTitle         string         `json:"site_title"`
	TagLine           string         `json:"tag_line"`
	Description       string         `json:"description"`
	SiteAddress       string         `json:"site_address"`
	LogoID            *uuid.UUID     `json:"logo_id"`
	Logo              *model.Medium  `gorm:"foreignKey:logo_id" json:"logo"`
	LogoMobileID      *uuid.UUID     `json:"logo_mobile_id"`
	LogoMobile        *model.Medium  `gorm:"foreignKey:logo_mobile_id" json:"logo_mobile"`
	FavIconID         *uuid.UUID     `json:"fav_icon_id"`
	FavIcon           *model.Medium  `gorm:"foreignKey:fav_icon_id" json:"fav_icon"`
	MobileIconID      *uuid.UUID     `json:"mobile_icon_id"`
	MobileIcon        *model.Medium  `gorm:"foreignKey:mobile_icon_id" json:"mobile_icon"`
	VerificationCodes postgres.Jsonb `json:"verification_codes" swaggertype:"primitive,string"`
	SocialMediaURLs   postgres.Jsonb `json:"social_media_urls" swaggertype:"primitive,string"`
	ContactInfo       postgres.Jsonb `json:"contact_info" swaggertype:"primitive,string"`
	Analytics         postgres.Jsonb `json:"analytics" swaggertype:"primitive,string"`
	HeaderCode        string         `json:"header_code"`
	FooterCode        string         `json:"footer_code"`
	MetaFields        postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	OrganisationID    string         `json:"organisation_id" validate:"required"`
}

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/my", my)
	r.Mount("/tokens", tokens.Router())
	r.Mount("/users", users.Router())
	r.Get("/", Details)
	r.Put("/", update)
	r.Delete("/", delete)

	return r
}
