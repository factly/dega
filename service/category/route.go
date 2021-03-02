package category

import (
	"github.com/go-chi/chi"
)

// Router category router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)

	return r
}
