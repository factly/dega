package post

import (
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// post request body
type post struct {
	Title            string         `json:"title" validate:"required,min=3,max=150"`
	Subtitle         string         `json:"subtitle"`
	Slug             string         `json:"slug"`
	Excerpt          string         `json:"excerpt" validate:"required,min=3,max=300"`
	Description      postgres.Jsonb `json:"description"`
	IsFeatured       bool           `json:"is_featured"`
	IsSticky         bool           `json:"is_sticky"`
	IsHighlighted    bool           `json:"is_highlighted"`
	FeaturedMediumID uint           `json:"featured_medium_id"`
	FormatID         uint           `json:"format_id" validate:"required"`
	SpaceID          uint           `json:"space_id"`
	CategoryIDs      []uint         `json:"category_ids"`
	TagIDs           []uint         `json:"tag_ids"`
	ClaimIDs         []uint         `json:"claim_ids"`
	AuthorIDs        []uint         `json:"author_ids"`
}

type postData struct {
	model.Post
	Authors []model.Author         `json:"authors"`
	Claims  []factCheckModel.Claim `json:"claims"`
}

// Router - Group of post router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "posts"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)
	r.With(util.CheckKetoPolicy(entity, "update")).Post("/templates", createTemplate)

	r.Route("/{post_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
		r.With(util.CheckKetoPolicy(entity, "publish")).Put("/publish", publish)
	})

	return r
}
