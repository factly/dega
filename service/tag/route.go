package tag

import "github.com/go-chi/chi"

// Router tag router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)

	return r
}
