package core

import (
	"net/http"

	"github.com/go-chi/chi"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/category"
	"github.com/factly/dega-server/service/core/action/format"
	"github.com/factly/dega-server/service/core/action/medium"
	"github.com/factly/dega-server/service/core/action/post"
	"github.com/factly/dega-server/service/core/action/space"
	"github.com/factly/dega-server/service/core/action/tag"
	"github.com/factly/dega-server/service/core/model"
)

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	config.DB.AutoMigrate(
		&model.Medium{},
		&model.Category{},
		&model.Tag{},
		&model.Space{},
		&model.Format{},
		&model.Post{},
		&model.PostCategory{},
		&model.PostTag{},
	)

	config.DB.Model(&model.Category{}).AddForeignKey("medium_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Space{}).AddForeignKey("logo_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Space{}).AddForeignKey("logo_mobile_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Space{}).AddForeignKey("fav_icon_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Space{}).AddForeignKey("mobile_icon_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Post{}).AddForeignKey("featured_medium_id", "media(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.Post{}).AddForeignKey("format_id", "formats(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.PostCategory{}).AddForeignKey("category_id", "categories(id)", "RESTRICT", "RESTRICT")
	config.DB.Model(&model.PostTag{}).AddForeignKey("tag_id", "tags(id)", "RESTRICT", "RESTRICT")

	r.Mount("/media", medium.Router())
	r.Mount("/categories", category.Router())
	r.Mount("/formats", format.Router())
	r.Mount("/tags", tag.Router())
	r.Mount("/spaces", space.Router())
	r.Mount("/posts", post.Router())

	return r
}
