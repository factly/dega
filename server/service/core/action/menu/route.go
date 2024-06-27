package menu

import (
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
)

// Router - Group of menu router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "menus"

	r.With(util.CheckEntityAccess(entity, "get")).Get("/", list)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/", create)

	r.Route("/{menu_id}", func(r chi.Router) {
		r.With(util.CheckEntityAccess(entity, "get")).Get("/", details)
		r.With(util.CheckEntityAccess(entity, "update")).Put("/", update)
		r.With(util.CheckEntityAccess(entity, "delete")).Delete("/", delete)
	})

	return r

}
