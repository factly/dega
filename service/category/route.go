package category

import (
	"github.com/go-chi/chi"
)

// Router category router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Get("/{slug}/formats/{format_slug}", postList)

	return r
}
