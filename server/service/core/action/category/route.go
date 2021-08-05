package category

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// category request body
type category struct {
	Name        string         `json:"name" validate:"required,min=3,max=50"`
	Slug        string         `json:"slug"`
	Description postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	ParentID    uint           `json:"parent_id"`
	MediumID    uint           `json:"medium_id"`
	IsFeatured  bool           `json:"is_featured"`
	MetaFields  postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta        postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode  string         `json:"header_code"`
	FooterCode  string         `json:"footer_code"`
}

var userContext config.ContextKey = "category_user"

// Router - Group of category router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "categories"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)

	r.Route("/{category_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}
