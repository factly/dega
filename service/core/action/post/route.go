package post

import (
	"time"

	"github.com/factly/dega-server/service/core/model"
	factcheckModel "github.com/factly/dega-server/service/factcheck/model"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// post request body
type post struct {
	Title            string         `json:"title" validate:"required,min=3,max=150"`
	Subtitle         string         `json:"subtitle"`
	Slug             string         `json:"slug"`
	Status           string         `json:"status" validate:"required"`
	Excerpt          string         `json:"excerpt" validate:"required,min=3,max=300"`
	Description      postgres.Jsonb `json:"description"`
	IsFeatured       bool           `json:"is_featured"`
	IsSticky         bool           `json:"is_sticky"`
	IsHighlighted    bool           `json:"is_highlighted"`
	FeaturedMediumID uint           `json:"featured_medium_id"`
	FormatID         uint           `json:"format_id" validate:"required"`
	PublishedDate    time.Time      `json:"published_date"`
	SpaceID          uint           `json:"space_id"`
	CategoryIDs      []uint         `json:"category_ids"`
	TagIDs           []uint         `json:"tag_ids"`
	ClaimIDs         []uint         `json:"claim_ids"`
	AuthorIDs        []uint         `json:"author_ids"`
}

type postData struct {
	model.Post
	Authors []model.Author         `json:"authors"`
	Claims  []factcheckModel.Claim `json:"claims"`
}

// Router - Group of post router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{post_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
