package claim

import (
	"time"

	"github.com/factly/dega-server/config"

	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type claim struct {
	Claim         string         `json:"claim" validate:"required,min=3,max=5000"`
	Slug          string         `json:"slug"`
	ClaimDate     *time.Time     `json:"claim_date" `
	CheckedDate   *time.Time     `json:"checked_date"`
	ClaimSources  postgres.Jsonb `json:"claim_sources" swaggertype:"primitive,string"`
	Description   postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	ClaimantID    uint           `json:"claimant_id" validate:"required"`
	RatingID      uint           `json:"rating_id" validate:"required"`
	MediumID      uint           `json:"medium_id"`
	Fact          string         `json:"fact"`
	ReviewSources postgres.Jsonb `json:"review_sources" swaggertype:"primitive,string"`
	MetaFields    postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta          postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode    string         `json:"header_code"`
	FooterCode    string         `json:"footer_code"`
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
