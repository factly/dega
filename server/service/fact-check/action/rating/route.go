package rating

import (
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
)

// Router - Group of rating router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "ratings"

	r.With(util.CheckEntityAccess(entity, "get")).Get("/", list)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/", create)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/default", createDefaults)

	r.Route("/{rating_id}", func(r chi.Router) {
		r.With(util.CheckEntityAccess(entity, "get")).Get("/", details)
		r.With(util.CheckEntityAccess(entity, "update")).Put("/", update)
		r.With(util.CheckEntityAccess(entity, "delete")).Delete("/", delete)
	})

	return r

}
