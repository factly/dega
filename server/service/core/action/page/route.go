package page

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

var meiliIndex = "post"

// page request body
type page struct {
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Title            string         `json:"title" validate:"required,min=3,max=150"`
	Subtitle         string         `json:"subtitle"`
	Slug             string         `json:"slug"`
	Excerpt          string         `json:"excerpt"`
	Description      postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	Status           string         `json:"status"`
	IsFeatured       bool           `json:"is_featured"`
	IsSticky         bool           `json:"is_sticky"`
	IsHighlighted    bool           `json:"is_highlighted"`
	FeaturedMediumID uuid.UUID      `json:"featured_medium_id"`
	PublishedDate    *time.Time     `json:"published_date"`
	FormatID         uuid.UUID      `json:"format_id" validate:"required"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	DescriptionAMP   string         `json:"description_amp"`
	MigrationID      *uuid.UUID     `json:"migration_id"`
	MigratedHTML     string         `json:"migrated_html"`
	SpaceID          uuid.UUID      `json:"space_id"`
	CategoryIDs      []uuid.UUID    `json:"category_ids"`
	TagIDs           []uuid.UUID    `json:"tag_ids"`
	AuthorIDs        []string       `json:"author_ids"`
}

type pageData struct {
	model.Post
	Authors []model.Author `json:"authors"`
}

var userContext config.ContextKey = "post_user"

func Router() chi.Router {
	r := chi.NewRouter()

	entity := "pages"

	r.With(util.CheckEntityAccess(entity, "get")).Get("/", list)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/", create)

	r.Route("/{page_id}", func(r chi.Router) {
		r.With(util.CheckEntityAccess(entity, "get")).Get("/", details)
		r.With(util.CheckEntityAccess(entity, "update")).Put("/", update)
		r.With(util.CheckEntityAccess(entity, "delete")).Delete("/", delete)
	})

	return r
}
