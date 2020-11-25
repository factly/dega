package spacePermission

import "github.com/go-chi/chi"

type spacePermission struct {
	SpaceID   uint `json:"space_id" validate:"required"`
	FactCheck bool `json:"fact_check"`
}

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Route("/{permission_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}
