package policy

import (
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
)

type policyReq struct {
	Name        string             `json:"name"`
	Description string             `json:"description"`
	Permissions []model.Permission `json:"permissions"`
	Users       []string           `json:"users"`
}

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "policies"

	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)
	r.Get("/", list)
	r.Route("/{policy_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r
}
