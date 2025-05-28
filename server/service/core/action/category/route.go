package category

import (
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
)

var meiliIndex = "category"

// Router - Group of category router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "categories"

	r.With(util.CheckEntityAccess(entity, "get")).Get("/", list)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/", create)

	r.Route("/{category_id}", func(r chi.Router) {
		r.With(util.CheckEntityAccess(entity, "get")).Get("/", details)
		r.With(util.CheckEntityAccess(entity, "update")).Put("/", update)
		r.With(util.CheckEntityAccess(entity, "delete")).Delete("/", delete)
	})

	return r

}
