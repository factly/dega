package claim

import (
	"time"

	"github.com/factly/dega-server/config"

	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type claim struct {
	Title         string         `json:"title" validate:"required,min=3,max=150"`
	Slug          string         `json:"slug"`
	ClaimDate     time.Time      `json:"claim_date" `
	CheckedDate   time.Time      `json:"checked_date"`
	ClaimSources  string         `json:"claim_sources"`
	Description   postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	ClaimantID    uint           `json:"claimant_id" validate:"required"`
	RatingID      uint           `json:"rating_id" validate:"required"`
	Review        string         `json:"review"`
	ReviewTagLine string         `json:"review_tag_line"`
	ReviewSources string         `json:"review_sources"`
}

var userContext config.ContextKey = "claim_user"

// Router - Group of claim router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "claims"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)

	r.Route("/{claim_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}
