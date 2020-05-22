package post

import (
	"time"

	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
)

// post request body
type post struct {
	Title            string    `json:"title"`
	Subtitle         string    `json:"subtitle"`
	Slug             string    `json:"slug"`
	Status           string    `json:"status"`
	Excerpt          string    `json:"excerpt"`
	Description      string    `json:"description"`
	Updates          string    `json:"updates"`
	IsFeatured       bool      `json:"is_featured"`
	IsSticky         bool      `json:"is_sticky"`
	IsHighlighted    bool      `json:"is_highlighted"`
	FeaturedMediumID uint      `json:"featured_medium_id"`
	FormatID         uint      `json:"format_id"`
	PublishedDate    time.Time `json:"published_date"`
	SpaceID          uint      `json:"space_id"`
	CategoryIDS      []uint    `json:"category_ids"`
	TagIDS           []uint    `json:"tag_ids"`
}

type postData struct {
	model.Post
	Categories []model.Category `json:"categories"`
	Tags       []model.Tag      `json:"tags"`
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
