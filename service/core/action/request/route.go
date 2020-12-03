package request

import (
	"net/http"

	"github.com/factly/dega-server/service/core/action/request/organisationPermission"
	"github.com/factly/dega-server/service/core/action/request/spacePermission"

	"github.com/go-chi/chi"
)

// Router - CRUD servies
func Router() http.Handler {
	r := chi.NewRouter()

	r.Mount("/spacePermissions", spacePermission.Router())
	r.Mount("/organisationPermissions", organisationPermission.Router())

	return r
}
