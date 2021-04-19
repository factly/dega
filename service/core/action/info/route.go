package info

import "github.com/go-chi/chi"

// Router - Group of category router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", details)

	return r

}
