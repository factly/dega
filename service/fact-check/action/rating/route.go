package rating

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// rating model
type rating struct {
	Name             string         `json:"name" validate:"required,min=3,max=50"`
	Slug             string         `json:"slug"`
	BackgroundColour postgres.Jsonb `json:"background_colour" validate:"required" swaggertype:"primitive,string"`
	TextColour       postgres.Jsonb `json:"text_colour" validate:"required" swaggertype:"primitive,string"`
	Description      postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	NumericValue     int            `json:"numeric_value" validate:"required"`
	MediumID         uint           `json:"medium_id"`
	MetaFields       postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
}

var userContext config.ContextKey = "rating_user"

// Router - Group of rating router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "ratings"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/default", createDefaults)

	r.Route("/{rating_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}
