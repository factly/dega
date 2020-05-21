package category

import "github.com/go-chi/chi"

// category request body
type category struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	ParentID    uint   `json:"parent_id"`
	MediumID    uint   `json:"medium_id"`
	SpaceID     uint   `json:"space_id"`
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
