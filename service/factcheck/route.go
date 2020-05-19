package factcheck

import (
	"net/http"

	"github.com/go-chi/chi"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/action/claim"
	"github.com/factly/dega-server/service/factcheck/action/claimant"
	"github.com/factly/dega-server/service/factcheck/action/rating"
	"github.com/factly/dega-server/service/factcheck/model"
)

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	config.DB.AutoMigrate(
		&model.Claimant{},
		&model.Rating{},
		&model.Claim{},
	)

	config.DB.Model(&model.Claimant{}).AddForeignKey("medium_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Rating{}).AddForeignKey("medium_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Claim{}).AddForeignKey("rating_id", "ratings(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Claim{}).AddForeignKey("claimant_id", "claimants(id)", "RESTRICT", "RESTRICT")

	r.Mount("/claimants", claimant.Router())
	r.Mount("/ratings", rating.Router())
	r.Mount("/claims", claim.Router())

	return r
}
