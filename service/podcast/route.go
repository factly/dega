package podcast

import (
	"net/http"

	podcast "github.com/factly/dega-server/service/podcast/action"
	"github.com/factly/dega-server/service/podcast/action/episode"
	"github.com/go-chi/chi"
)

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.Mount("/podcasts", podcast.Router())
	r.Mount("/episodes", episode.Router())

	return r
}
