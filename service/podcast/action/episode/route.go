package episode

import (
	"time"

	"github.com/factly/dega-server/config"
	coreModel "github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/service/podcast/model"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// episode model
type episode struct {
	Title         string         `json:"title"  validate:"required,min=3,max=50"`
	Slug          string         `json:"slug"`
	Season        int            `json:"season"  validate:"required"`
	Episode       int            `json:"episode"  validate:"required"`
	AudioURL      string         `json:"audio_url" validate:"required"`
	Description   postgres.Jsonb `json:"description" swaggertype:"primitive,string"`
	PublishedDate *time.Time     `json:"published_date" sql:"DEFAULT:NULL"`
	MediumID      uint           `json:"medium_id"`
	SpaceID       uint           `json:"space_id"`
	AuthorIDs     []uint         `json:"author_ids"`
}

type episodeData struct {
	model.Episode
	Authors []coreModel.Author `json:"authors"`
}

var episodeUser config.ContextKey = "episode_user"

// Router - Group of episode router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "episodes"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)

	r.Route("/{episode_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}
