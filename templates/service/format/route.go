package format

import "github.com/go-chi/chi"

// Router format router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/{slug}", list)

	return r
}
