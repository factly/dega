package menu

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// menu request body
type menu struct {
	Name string         `json:"name" validate:"required,min=3,max=50"`
	Slug string         `json:"slug"`
	Menu postgres.Jsonb `json:"menu" swaggertype:"primitive,string"`
}

var userContext config.ContextKey = "menu_user"

// Router - Group of menu router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "menus"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)

	r.Route("/{menu_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}
