package spacePermission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var permissionContext config.ContextKey = "space_perm_user"

type spacePermissionRequest struct {
	Description postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	FactCheck   bool           `json:"fact_check"`
	Media       int64          `json:"media"`
	Posts       int64          `json:"posts"`
	SpaceID     int64          `json:"space_id" validate:"required"`
}

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.With(middlewarex.CheckSuperOrganisation("dega", util.GetOrganisation)).Get("/", list)
	r.Get("/my", my)
	r.With(middlewarex.CheckSuperOrganisation("dega", util.GetOrganisation)).Route("/{request_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Delete("/", delete)
		r.Post("/approve", approve)
		r.Post("/reject", reject)
	})

	return r
}

// SpaceRequestRouter - Create endpoint for space permission requests
func SpaceRequestRouter() chi.Router {
	r := chi.NewRouter()
	r.Post("/", create)

	return r
}
