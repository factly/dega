package space

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
)

type spacePermission struct {
	SpaceID   uint  `json:"space_id" validate:"required"`
	FactCheck bool  `json:"fact_check"`
	Media     int64 `json:"media"`
	Posts     int64 `json:"posts"`
}

var userContext config.ContextKey = "space_perm_user"

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	app := "dega"

	r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Get("/", list)
	r.Get("/my", my)
	r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Post("/", create)
	r.Route("/{permission_id}", func(r chi.Router) {
		r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Get("/", details)
		r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Put("/", update)
		r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Delete("/", delete)
	})

	return r
}
