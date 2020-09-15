package author

import (
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
)

// Router - Group of category router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(util.CheckKetoPolicy("authors", "get")).Get("/", list)
	return r

}
