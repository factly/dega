package organisation

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
)

type organisationPermission struct {
	OrganisationID uint  `json:"organisation_id" validate:"required"`
	Spaces         int64 `json:"spaces"`
}

var userContext config.ContextKey = "org_perm_user"

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	app := "dega"

	r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Get("/", list)
	r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Post("/", create)
	r.Get("/my", details)
	r.Route("/{permission_id}", func(r chi.Router) {
		r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Put("/", update)
		r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Delete("/", delete)
	})

	return r

}
