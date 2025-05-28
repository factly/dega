package factcheck

import (
	"net/http"

	"github.com/go-chi/chi"

	"github.com/factly/dega-server/service/fact-check/action/claim"
	"github.com/factly/dega-server/service/fact-check/action/claimant"
	"github.com/factly/dega-server/service/fact-check/action/google"
	"github.com/factly/dega-server/service/fact-check/action/rating"
)

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.Mount("/claimants", claimant.Router())
	r.Mount("/ratings", rating.Router())
	r.Mount("/claims", claim.Router())
	r.Mount("/google", google.Router())

	return r
}

func PublicRouter() http.Handler {
	r := chi.NewRouter()

	r.Get("/claimants", claimant.List)
	r.Get("/ratings", rating.List)
	r.Get("/claims", claim.List)

	return r
}
