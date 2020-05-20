package medium

import (
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// medium model
type medium struct {
	Name        string         `json:"name"`
	Slug        string         `json:"slug"`
	Type        string         `json:"type"`
	Title       string         `json:"title"`
	Description string         `json:"description"`
	Caption     string         `json:"caption"`
	AltText     string         `json:"alt_text"`
	FileSize    int64          `json:"file_size"`
	URL         postgres.Jsonb `json:"url"`
	Dimensions  string         `json:"dimensions"`
	SpaceID     uint           `json:"space_id"`
}

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{medium_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
