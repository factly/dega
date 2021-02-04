package organisationPermission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/jinzhu/gorm/dialects/postgres"

	"github.com/go-chi/chi"
)

var permissionContext config.ContextKey = "org_perm_user"

type organisationPermissionRequest struct {
	OrganisationID uint           `json:"organisation_id" validate:"required"`
	Description    postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	Spaces         int64          `json:"spaces"`
}

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.With(util.CheckSuperOrganisation).Get("/", list)
	r.Get("/my", my)
	r.With(util.CheckSuperOrganisation).Route("/{request_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Delete("/", delete)
		r.Post("/approve", approve)
		r.Post("/reject", reject)
	})

	return r
}

// OrgRequestRouter - Create endpoint for organisation permission request
func OrgRequestRouter() chi.Router {
	r := chi.NewRouter()
	r.Post("/", create)

	return r
}
