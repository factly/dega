package format

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// format model
type format struct {
	Name        string         `json:"name" validate:"required,min=3,max=50"`
	Slug        string         `json:"slug"`
	Description string         `json:"description"`
	MetaFields  postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta        postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode  string         `json:"header_code"`
	FooterCode  string         `json:"footer_code"`
}

var userContext config.ContextKey = "format_user"

// Router - Group of tag router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "formats"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/default", createDefaults)

	r.Route("/{format_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}
