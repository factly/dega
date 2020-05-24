package category

import "github.com/go-chi/chi"

// category request body
type category struct {
	Name        string `json:"name" validate:"required"`
	Slug        string `json:"slug" validate:"required"`
	Description string `json:"description" validate:"required"`
	ParentID    uint   `json:"parent_id"`
	MediumID    uint   `json:"medium_id" validate:"required"`
	SpaceID     uint   `json:"space_id" validate:"required"`
}

// Router - Group of category router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{category_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
