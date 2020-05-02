package core

import (
	"net/http"

	"github.com/go-chi/chi"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/category"
	"github.com/factly/dega-server/service/core/action/medium"
	"github.com/factly/dega-server/service/core/model"
)

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	config.DB.AutoMigrate(
		&model.Medium{},
		&model.Category{},
	)

	config.DB.Model(&model.Category{}).AddForeignKey("medium_id", "media(id)", "RESTRICT", "RESTRICT")

	r.Mount("/media", medium.Router())
	r.Mount("/categories", category.Router())

	return r
}
