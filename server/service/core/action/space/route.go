package space

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/role"
	"github.com/go-chi/chi"
)

var userContext config.ContextKey = "space_user"

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", my)
	r.Route("/{space_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Mount("/roles", role.Router())
		r.Delete("/", delete)
		r.Get("/users", users)
	})

	return r
}
