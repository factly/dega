package event

import (
	"github.com/factly/dega-server/util"
	"github.com/factly/x/middlewarex"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type event struct {
	Name string         `json:"name" validate:"required"`
	Tags postgres.Jsonb `json:"tags" swaggertype:"primitive,string"`
}

// Router events endpoint router
func Router() chi.Router {
	r := chi.NewRouter()

	app := "dega"

	r.Get("/", list)
	r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Post("/", create)

	r.Route("/{event_id}", func(r chi.Router) {
		r.Get("/", details)
		r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Put("/", update)
		r.With(middlewarex.CheckSuperOrganisation(app, util.GetOrganisation)).Delete("/", delete)
	})

	return r
}
