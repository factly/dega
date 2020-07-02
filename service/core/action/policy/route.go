package policy

import (
	"github.com/factly/dega-server/service/core/model"
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

	r.Post("/", create)
	r.Get("/", list)
	r.Route("/{policy_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}
