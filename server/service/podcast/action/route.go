package podcast

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// podcast model
type podcast struct {
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	Title             string         `json:"title"  validate:"required,max=500"`
	Slug              string         `json:"slug"`
	Language          string         `json:"language"  validate:"required"`
	Description       postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	MediumID          uint           `json:"medium_id"`
	SpaceID           uint           `json:"space_id"`
	PrimaryCategoryID uint           `json:"primary_category_id"`
	CategoryIDs       []uint         `json:"category_ids"`
	HeaderCode        string         `json:"header_code"`
	FooterCode        string         `json:"footer_code"`
	MetaFields        postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
}

var podcastUser config.ContextKey = "podcast_user"

// Router - Group of podcast router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "podcasts"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)

	r.Route("/{podcast_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}
