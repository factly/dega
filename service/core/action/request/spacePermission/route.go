package spacePermission

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
)

var permissionContext config.ContextKey = "space_perm_user"

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
