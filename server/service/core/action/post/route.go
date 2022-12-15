package post

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	factCheckModel "github.com/factly/dega-server/service/fact-check/model"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
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
	FeaturedMediumID uint           `json:"featured_medium_id"`
	PublishedDate    *time.Time     `json:"published_date"`
	FormatID         uint           `json:"format_id" validate:"required"`
	SpaceID          uint           `json:"space_id"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	DescriptionAMP   string         `json:"description_amp"`
	IsMigrated       bool           `json:"is_migrated"`
	MigratedHTML     string         `json:"migrated_html"`
	CategoryIDs      []uint         `json:"category_ids"`
	TagIDs           []uint         `json:"tag_ids"`
	ClaimIDs         []uint         `json:"claim_ids"`
	AuthorIDs        []uint         `json:"author_ids"`
}

type postData struct {
	model.Post
	Authors    []model.Author         `json:"authors"`
	Claims     []factCheckModel.Claim `json:"claims"`
	ClaimOrder []uint                 `json:"claim_order"`
}

var userContext config.ContextKey = "post_user"

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
	})

	return r
}
