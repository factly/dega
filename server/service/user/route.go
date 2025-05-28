package user

import (
	"github.com/go-chi/chi"
)

// Router - Group of category router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Route("/profile", func(r chi.Router) {
		r.Get("/", details)
	})

	return r
}
