package claimant

import (
	"time"

	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// claimant model
type claimant struct {
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	Name        string         `json:"name" validate:"required,max=500"`
	Slug        string         `json:"slug"`
	IsFeatured  bool           `json:"is_featured"`
	Description postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	TagLine     string         `json:"tag_line"`
	MediumID    uint           `json:"medium_id"`
	MetaFields  postgres.Jsonb `json:"meta_fields" swaggertype:"primitive,string"`
	Meta        postgres.Jsonb `json:"meta" swaggertype:"primitive,string"`
	HeaderCode  string         `json:"header_code"`
	FooterCode  string         `json:"footer_code"`
}

var meiliIndex = "claimant"

// Router - Group of claimant router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "claimants"

	r.With(util.CheckEntityAccess(entity, "get")).Get("/", List)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/", create)

	r.Route("/{claimant_id}", func(r chi.Router) {
		r.With(util.CheckEntityAccess(entity, "get")).Get("/", details)
		r.With(util.CheckEntityAccess(entity, "update")).Put("/", update)
		r.With(util.CheckEntityAccess(entity, "delete")).Delete("/", delete)
	})

	return r

}
