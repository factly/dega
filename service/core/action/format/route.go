package format

import (
	"github.com/go-chi/chi"
)

// format model
type format struct {
	Name        string `json:"name" validate:"required,min=3,max=50"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
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
