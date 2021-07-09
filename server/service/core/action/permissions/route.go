package permissions

import (
	"github.com/factly/dega-server/service/core/action/permissions/organisation"
	"github.com/factly/dega-server/service/core/action/permissions/space"
	"github.com/go-chi/chi"
)

// Router router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Mount("/organisations", organisation.Router())
	r.Mount("/spaces", space.Router())

	return r

}
