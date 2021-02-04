package spacePermission

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type spacePermission struct {
	SpaceID   uint  `json:"space_id" validate:"required"`
	FactCheck bool  `json:"fact_check"`
	Media     int64 `json:"media"`
	Posts     int64 `json:"posts"`
}

type spacePermissionRequest struct {
	Title       string         `json:"title" validate:"required"`
	Description postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	FactCheck   bool           `json:"fact_check"`
	Media       int64          `json:"media"`
	Posts       int64          `json:"posts"`
	SpaceID     int64          `json:"space_id" validate:"required"`
}

var userContext config.ContextKey = "space_perm_user"
var requestUserContext config.ContextKey = "request_user"

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(util.CheckSuperOrganisation).Get("/", list)
	r.Get("/my", my)
	r.Post("/request", request)
	r.With(util.CheckSuperOrganisation).Post("/", create)
	r.Route("/{permission_id}", func(r chi.Router) {
		r.With(util.CheckSuperOrganisation).Get("/", details)
		r.With(util.CheckSuperOrganisation).Put("/", update)
		r.With(util.CheckSuperOrganisation).Delete("/", delete)
	})

	return r
}
