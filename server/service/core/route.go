package core

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/action/event"
	"github.com/factly/dega-server/service/core/action/info"
	"github.com/factly/dega-server/service/core/action/menu"
	"github.com/factly/dega-server/service/core/action/page"
	"github.com/factly/dega-server/service/core/action/webhook"
	"github.com/factly/dega-server/util"

	"github.com/go-chi/chi"

	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/action/category"
	"github.com/factly/dega-server/service/core/action/format"
	"github.com/factly/dega-server/service/core/action/medium"
	"github.com/factly/dega-server/service/core/action/policy"
	"github.com/factly/dega-server/service/core/action/post"
	"github.com/factly/dega-server/service/core/action/search"
	"github.com/factly/dega-server/service/core/action/space"
	"github.com/factly/dega-server/service/core/action/tag"
	"github.com/factly/dega-server/service/core/action/user"
)

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.Mount("/media", medium.Router())
	r.Mount("/menus", menu.Router())
	r.Mount("/categories", category.Router())
	r.Mount("/formats", format.Router())
	r.Mount("/tags", tag.Router())
	r.Mount("/spaces", space.Router())
	r.Mount("/posts", post.Router())
	r.Mount("/pages", page.Router())
	r.Mount("/policies", policy.Router())
	r.Mount("/authors", author.Router())
	r.Mount("/users", user.Router())
	r.Mount("/info", info.Router())
	if config.SearchEnabled() {
		r.Mount("/search", search.Router())
	}
	if util.CheckNats() {
		r.Mount("/webhooks", webhook.Router())
		r.Mount("/events", event.Router())
	}

	return r
}

func PublicRouter() http.Handler {
	r := chi.NewRouter()

	r.Get("/space", space.Details)
	r.Get("/menus", menu.List)
	r.Get("/categories", category.PublicList)
	r.Get("/tags", tag.PublicList)
	r.Get("/formats", format.List)
	r.Get("/authors", author.List)

	return r
}
