package webhook

import (
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type webhook struct {
	URL      string         `json:"url" validate:"required"`
	Enabled  bool           `json:"enabled"`
	EventIDs []uint         `json:"event_ids" validate:"required"`
	Tags     postgres.Jsonb `json:"tags" swaggertype:"primitive,string"`
}

// Router webhooks endpoint router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	// r.Get("/logs", logs)
	r.Post("/", create)
	r.Get("/logs", logs)
	r.Route("/{webhook_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}
