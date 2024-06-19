package reindex

import (
	"github.com/go-chi/chi"
)

// Router - Group of reindex router
func Router() chi.Router {
	r := chi.NewRouter()

	//TODO
	// r.With(middlewarex.CheckSuperOrganisation("dega", util.GetOrganisation)).Post("/all", all)
	r.Post("/space/{space_id}", space)

	return r
}
