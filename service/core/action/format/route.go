package format

import (
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// format model
type format struct {
	Name             string         `json:"name" validate:"required"`
	Slug             string         `json:"slug" validate:"required"`
	Description      string         `json:"description"`
	AdditionalFields postgres.Jsonb `json:"additional_fields"`
	SpaceID          uint           `json:"space_id"`
}

// Router - Group of tag router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{format_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
