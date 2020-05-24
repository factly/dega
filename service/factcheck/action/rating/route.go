package rating

import "github.com/go-chi/chi"

// rating model
type rating struct {
	Name         string `json:"name" validate:"required"`
	Slug         string `json:"slug" validate:"required"`
	Description  string `json:"description" validate:"required"`
	NumericValue string `json:"numeric_value" validate:"required"`
	MediumID     uint   `json:"medium_id" validate:"required"`
	SpaceID      uint   `json:"space_id" validate:"required"`
}

// Router - Group of rating router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{rating_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
