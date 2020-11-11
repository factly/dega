package organisationPermission

import (
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
)

type organisationPermission struct {
	OrganisationID uint  `json:"organisation_id" validate:"required"`
	Spaces         int64 `json:"spaces"`
	Media          int64 `json:"media"`
	Posts          int64 `json:"posts"`
	FactCheck      bool  `json:"fact_check"`
}

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	r.With(util.CheckSuperOrganisation).Get("/", list)
	r.With(util.CheckSuperOrganisation).Post("/", create)
	r.Get("/my", details)

	r.Route("/{permission_id}", func(r chi.Router) {
		r.With(util.CheckSuperOrganisation).Put("/", update)
		r.With(util.CheckSuperOrganisation).Delete("/", delete)
	})

	return r

}
