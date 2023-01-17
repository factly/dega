package webhook

import (
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type webhook struct {
	Name     string         `json:"name"`
	URL      string         `json:"url" validate:"required"`
	Enabled  bool           `json:"enabled"`
	EventIDs []uint         `json:"event_ids" validate:"required"`
	Tags     postgres.Jsonb `json:"tags" swaggertype:"primitive,string"`
}

// Router webhooks endpoint router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "webhooks"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)
	r.Route("/{webhook_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/logs", logs)
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r
}
