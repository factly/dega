package organisationPermission

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type organisationPermission struct {
	OrganisationID uint  `json:"organisation_id" validate:"required"`
	Spaces         int64 `json:"spaces"`
}

type organisationPermissionRequest struct {
	Title          string         `json:"title" validate:"required"`
	OrganisationID uint           `json:"organisation_id" validate:"required"`
	Description    postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	Spaces         int64          `json:"spaces"`
}

var userContext config.ContextKey = "org_perm_user"
var requestUserContext config.ContextKey = "request_user"

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(util.CheckSuperOrganisation).Get("/", list)
	r.With(util.CheckSuperOrganisation).Post("/", create)
	r.Get("/my", details)
	r.Route("/{permission_id}", func(r chi.Router) {
		r.With(util.CheckSuperOrganisation).Put("/", update)
		r.With(util.CheckSuperOrganisation).Delete("/", delete)
	})

	return r

}

// OrgRequestRouter - Create endpoint for organisation permission request
func OrgRequestRouter() chi.Router {
	r := chi.NewRouter()
	r.Post("/", request)

	return r
}
