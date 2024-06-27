package post

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// post request body
type post struct {
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Title            string         `json:"title" validate:"required,max=500"`
	Subtitle         string         `json:"subtitle"`
	Slug             string         `json:"slug"`
	Excerpt          string         `json:"excerpt"`
	Description      postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	Status           string         `json:"status"`
	IsPage           bool           `json:"is_page"`
	IsFeatured       bool           `json:"is_featured"`
	IsSticky         bool           `json:"is_sticky"`
	IsHighlighted    bool           `json:"is_highlighted"`
	FeaturedMediumID uuid.UUID      `json:"featured_medium_id"`
	PublishedDate    *time.Time     `json:"published_date"`
	FormatID         uuid.UUID      `json:"format_id" validate:"required"`
	SpaceID          uuid.UUID      `json:"space_id"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	DescriptionAMP   string         `json:"description_amp"`
	MigrationID      *uuid.UUID     `json:"migration_id"`
	MigratedHTML     string         `json:"migrated_html"`
	CategoryIDs      []uuid.UUID    `json:"category_ids"`
	TagIDs           []uuid.UUID    `json:"tag_ids"`
	ClaimIDs         []uuid.UUID    `json:"claim_ids"`
	AuthorIDs        []string       `json:"author_ids"`
}

type postData struct {
	model.Post
	Authors    []model.Author         `json:"authors"`
	Claims     []factCheckModel.Claim `json:"claims"`
	ClaimOrder []uuid.UUID            `json:"claim_order"`
}

var userContext config.ContextKey = "post_user"

// Router - Group of post router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "posts"

	r.With(util.CheckEntityAccess(entity, "get")).Get("/", list)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/", create)
	r.With(util.CheckEntityAccess(entity, "update")).Post("/templates", createTemplate)

	r.Route("/{post_id}", func(r chi.Router) {
		r.With(util.CheckEntityAccess(entity, "get")).Get("/", details)
		r.With(util.CheckEntityAccess(entity, "update")).Put("/", update)
		r.With(util.CheckEntityAccess(entity, "delete")).Delete("/", delete)
	})

	return r
}
