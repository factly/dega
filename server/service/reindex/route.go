package reindex

import (
	"github.com/go-chi/chi"
)

// Router - Group of reindex router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/space/{space_id}", space)

	return r
}
