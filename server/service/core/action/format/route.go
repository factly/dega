package format

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// format model
type format struct {
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Name        string         `json:"name" validate:"required,min=3,max=50"`
	Slug        string         `json:"slug"`
	Description string         `json:"description"`
	MetaFields  postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta        postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode  string         `json:"header_code"`
	FooterCode  string         `json:"footer_code"`
	MediumID    uuid.UUID      `json:"medium_id"`
}

var userContext config.ContextKey = "format_user"

var meiliIndex = "format"

// Router - Group of tag router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "formats"

	r.With(util.CheckEntityAccess(entity, "get")).Get("/", List)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/", create)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/default", createDefaults)

	r.Route("/{format_id}", func(r chi.Router) {
		r.With(util.CheckEntityAccess(entity, "get")).Get("/", details)
		r.With(util.CheckEntityAccess(entity, "update")).Put("/", update)
		r.With(util.CheckEntityAccess(entity, "delete")).Delete("/", delete)
	})

	return r

}
