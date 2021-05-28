package author

import "github.com/go-chi/chi"

// Router authors router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Get("/{author_id}", details)
	r.Get("/{slug}/formats/{format_slug}", postList)

	return r
}
