package claimant

import "github.com/go-chi/chi"

// claimant model
type claimant struct {
	Name        string `json:"name" validate:"required"`
	Slug        string `json:"slug" validate:"required"`
	Description string `json:"description"`
	TagLine     string `json:"tag_line" validate:"required"`
	MediumID    uint   `json:"medium_id"`
	SpaceID     uint   `json:"space_id" validate:"required"`
}

// Router - Group of claimant router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{claimant_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
