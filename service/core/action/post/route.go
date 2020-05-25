package post

import (
	"time"

	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
)

// post request body
type post struct {
	Title            string    `json:"title" validate:"required"`
	Subtitle         string    `json:"subtitle" validate:"required"`
	Slug             string    `json:"slug" validate:"required"`
	Status           string    `json:"status" validate:"required"`
	Excerpt          string    `json:"excerpt" validate:"required"`
	Description      string    `json:"description" validate:"required"`
	Updates          string    `json:"updates" `
	IsFeatured       bool      `json:"is_featured"`
	IsSticky         bool      `json:"is_sticky"`
	IsHighlighted    bool      `json:"is_highlighted"`
	FeaturedMediumID uint      `json:"featured_medium_id"`
	FormatID         uint      `json:"format_id" validate:"required"`
	PublishedDate    time.Time `json:"published_date" validate:"required"`
	SpaceID          uint      `json:"space_id" validate:"required"`
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
