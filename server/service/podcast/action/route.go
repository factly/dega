package podcast

import (
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
)

// Router - Group of podcast router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "podcasts"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)

	r.Route("/{podcast_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}
