package role

import (
	"github.com/factly/dega-server/service/core/action/role/user"
	"github.com/go-chi/chi"
)

func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Route("/{role_id}", func(r chi.Router) {
		r.Put("/", update)
		r.Delete("/", delete)
		r.Get("/", details)
		r.Mount("/users", user.Router())
	})

	return r
}
