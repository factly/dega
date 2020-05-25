package claim

import (
	"time"

	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

type claim struct {
	Title         string         `json:"title" validate:"required"`
	Slug          string         `json:"slug" validate:"required"`
	ClaimDate     time.Time      `json:"claim_date" `
	CheckedDate   time.Time      `json:"checked_date"`
	ClaimSources  string         `json:"claim_sources" validate:"required"`
	Description   postgres.Jsonb `json:"description"`
	ClaimantID    uint           `json:"claimant_id" validate:"required"`
	RatingID      uint           `json:"rating_id" validate:"required"`
	Review        string         `json:"review" validate:"required"`
	ReviewTagLine string         `json:"review_tag_line"`
	ReviewSources string         `json:"review_sources" validate:"required"`
	SpaceID       uint           `json:"space_id" validate:"required"`
}

// Router - Group of claim router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{claim_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
