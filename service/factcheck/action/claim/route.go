package claim

import (
	"time"

	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type claim struct {
	Claim           string         `json:"claim"`
	Slug            string         `json:"slug"`
	ClaimDate       time.Time      `json:"claim_date"`
	CheckedDate     time.Time      `json:"checked_date"`
	ClaimSources    string         `json:"claim_sources"`
	Description     postgres.Jsonb `json:"description"`
	ClaimantID      uint           `json:"claimant_id"`
	RatingID        uint           `json:"rating_id"`
	Review          string         `json:"review"`
	ReviewTagLine   string         `json:"review_tag_line"`
	ReviewSources   string         `json:"review_sources"`
	LastUpdatedByID uint           `json:"last_updated_by_id"`
	CreatedByID     uint           `json:"created_by_id"`
	MetaFields      postgres.Jsonb `json:"meta_fields"`
	SpaceID         uint           `json:"space_id"`
}

// Router - Group of claim router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
