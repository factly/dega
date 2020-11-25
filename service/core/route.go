package core

import (
	"net/http"

	"github.com/go-chi/chi"

	"github.com/factly/dega-server/service/core/action/author"
	"github.com/factly/dega-server/service/core/action/category"
	"github.com/factly/dega-server/service/core/action/format"
	"github.com/factly/dega-server/service/core/action/medium"
	"github.com/factly/dega-server/service/core/action/organisationPermission"
	"github.com/factly/dega-server/service/core/action/policy"
	"github.com/factly/dega-server/service/core/action/post"
	"github.com/factly/dega-server/service/core/action/search"
	"github.com/factly/dega-server/service/core/action/space"
	"github.com/factly/dega-server/service/core/action/spacePermission"
	"github.com/factly/dega-server/service/core/action/tag"
	"github.com/factly/dega-server/service/core/action/user"
)

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.Mount("/media", medium.Router())
	r.Mount("/categories", category.Router())
	r.Mount("/formats", format.Router())
	r.Mount("/tags", tag.Router())
	r.Mount("/spaces", space.Router())
	r.Mount("/posts", post.Router())
	r.Mount("/policies", policy.Router())
	r.Mount("/authors", author.Router())
	r.Mount("/search", search.Router())
	r.Mount("/users", user.Router())
	r.Mount("/organisations/permissions", organisationPermission.Router())
	r.Mount("/spaces/permissions", spacePermission.Router())

	return r
}
