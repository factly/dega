package spacePermission

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
)

type spacePermission struct {
	SpaceID   uint `json:"space_id" validate:"required"`
	FactCheck bool `json:"fact_check"`
}

var userContext config.ContextKey = "space_perm_user"

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(util.CheckSuperOrganisation).Get("/", list)
	r.Get("/my", my)
	r.With(util.CheckSuperOrganisation).Post("/", create)
	r.Route("/{permission_id}", func(r chi.Router) {
		r.With(util.CheckSuperOrganisation).Get("/", details)
		r.With(util.CheckSuperOrganisation).Put("/", update)
		r.With(util.CheckSuperOrganisation).Delete("/", delete)
	})

	return r
}
