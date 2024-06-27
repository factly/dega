package category

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// category request body
type category struct {
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	Name             string         `json:"name" validate:"required,max=500"`
	Slug             string         `json:"slug"`
	BackgroundColour postgres.Jsonb `json:"background_colour" validate:"required" swaggertype:"primitive,string"`
	Description      postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	ParentID         uuid.UUID      `json:"parent_id"`
	MediumID         uuid.UUID      `json:"medium_id"`
	IsFeatured       bool           `json:"is_featured"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta             postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode       string         `json:"header_code"`
	FooterCode       string         `json:"footer_code"`
}

var userContext config.ContextKey = "category_user"

// Router - Group of category router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "categories"

	r.With(util.CheckEntityAccess(entity, "get")).Get("/", list)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/", create)

	r.Route("/{category_id}", func(r chi.Router) {
		r.With(util.CheckEntityAccess(entity, "get")).Get("/", details)
		r.With(util.CheckEntityAccess(entity, "update")).Put("/", update)
		r.With(util.CheckEntityAccess(entity, "delete")).Delete("/", delete)
	})

	return r

}
