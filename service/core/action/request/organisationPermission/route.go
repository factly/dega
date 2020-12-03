package organisationPermission

import (
	"net/http"

	"github.com/factly/dega-server/config"

	"github.com/go-chi/chi"
)

var permissionContext config.ContextKey = "org_perm_user"

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Route("/{request_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Post("/approve", approve)
		r.Post("/reject", reject)
	})

	return r
}
