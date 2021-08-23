package reindex

import (
	"github.com/factly/dega-server/util"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
)

// Router - Group of reindex router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(middlewarex.CheckSuperOrganisation("dega", util.GetOrganisation)).Post("/all", all)
	r.Post("/space/{space_id}", space)

	return r
}
