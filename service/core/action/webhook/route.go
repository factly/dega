package webhook

import "github.com/go-chi/chi"

type webhook struct {
	URL      string `json:"url" validate:"required"`
	Enabled  bool   `json:"enabled"`
	EventIDs []uint `json:"event_ids" validate:"required"`
}

// Router webhooks endpoint router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	// r.Get("/logs", logs)
	r.Post("/", create)
	r.Route("/{webhook_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}
