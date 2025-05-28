package users

import (
	"github.com/go-chi/chi"
)

type req struct {
	IDs []string `json:"ids"`
}

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Put("/", update)
	r.Get("/", list)

	return r
}
