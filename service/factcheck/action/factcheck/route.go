package factcheck

import (
	"time"

	coreModel "github.com/factly/dega-server/service/core/model"
	factcheckModel "github.com/factly/dega-server/service/factcheck/model"
	"github.com/go-chi/chi"
)

// factcheck request body
type factcheck struct {
	Title            string    `json:"title"`
	Subtitle         string    `json:"subtitle"`
	Slug             string    `json:"slug"`
	Excerpt          string    `json:"excerpt"`
	Description      string    `json:"description"`
	Updates          string    `json:"updates"`
	IsFeatured       bool      `json:"is_featured"`
	IsSticky         bool      `json:"is_sticky"`
	IsHighlighted    bool      `json:"is_highlighted"`
	FeaturedMediumID uint      `json:"featured_medium_id"`
	PublishedDate    time.Time `json:"published_date"`
	SpaceID          uint      `json:"space_id"`
	CategoryIDS      []uint    `json:"category_ids"`
	TagIDS           []uint    `json:"tag_ids"`
	ClaimIDS         []uint    `json:"claim_ids"`
}

type factcheckData struct {
	factcheckModel.Factcheck
	Categories []coreModel.Category   `json:"categories"`
	Tags       []coreModel.Tag        `json:"tags"`
	Claims     []factcheckModel.Claim `json:"claims"`
}

type factcheckList struct {
	factcheckModel.Factcheck
	Categories []coreModel.Category `json:"categories"`
	Tags       []coreModel.Tag      `json:"tags"`
}

// Router - Group of factcheck router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{factcheck_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
