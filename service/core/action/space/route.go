package space

import (
	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// space request body
type space struct {
	Name              string         `json:"name" validate:"required"`
	Slug              string         `json:"slug" validate:"required"`
	SiteTitle         string         `json:"site_title"`
	TagLine           string         `json:"tag_line"`
	Description       string         `json:"description"`
	SiteAddress       string         `json:"site_address"`
	LogoID            *uint          `json:"logo_id"`
	LogoMobileID      *uint          `json:"logo_mobile_id"`
	FavIconID         *uint          `json:"fav_icon_id"`
	MobileIconID      *uint          `json:"mobile_icon_id"`
	VerificationCodes postgres.Jsonb `json:"verification_codes"`
	SocialMediaURLs   postgres.Jsonb `json:"social_media_urls"`
	ContactInfo       postgres.Jsonb `json:"contact_info"`
	OrganisationID    int            `json:"organisation_id" validate:"required"`
}

// CheckSpaceUpdate - validation for media
func (s *space) CheckSpaceUpdate(tx *gorm.DB, id uint) (err error) {
	if s.LogoID != nil {

		medium := model.Medium{}
		medium.ID = *s.LogoID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: id,
		}).First(&medium).Error

		if err != nil {
			return err
		}
	}

	if s.LogoMobileID != nil {
		medium := model.Medium{}
		medium.ID = *s.LogoMobileID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: id,
		}).First(&medium).Error

		if err != nil {
			return err
		}
	}

	if s.FavIconID != nil {
		medium := model.Medium{}
		medium.ID = *s.FavIconID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: id,
		}).First(&medium).Error

		if err != nil {
			return err
		}
	}

	if s.MobileIconID != nil {
		medium := model.Medium{}
		medium.ID = *s.MobileIconID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: id,
		}).First(&medium).Error

		if err != nil {
			return err
		}
	}
	return nil
}

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
