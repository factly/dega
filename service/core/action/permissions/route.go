package permissions

import (
	"github.com/factly/dega-server/service/core/action/permissions/organisationPermission"
	"github.com/factly/dega-server/service/core/action/permissions/spacePermission"
	"github.com/go-chi/chi"
)

// Router router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Mount("/organisations", organisationPermission.Router())
	r.Mount("/spaces", spacePermission.Router())

	return r

}
