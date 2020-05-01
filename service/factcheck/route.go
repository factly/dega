package factcheck

import (
	"net/http"

	"github.com/go-chi/chi"

	"github.com/factly/dega-server/service/factcheck/action/claimant"
)

// RegisterRoutes - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.Mount("/claimants", claimant.Router())

	return r
}
