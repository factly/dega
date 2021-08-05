package profile

import (
	"github.com/go-chi/chi"
)

// Router - Group of category router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", redirectToKavach)
	r.Put("/", redirectToKavach)

	return r
}
