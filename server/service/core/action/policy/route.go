package policy

import (
	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

type policyReq struct {
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Permissions []permission `json:"permissions"`
	Users       []string     `json:"users"`
}

type permission struct {
	Actions  []string `json:"actions"`
	Resource string   `json:"resource"`
}

type policyRes struct {
	ID          uuid.UUID    `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Permissions []permission `json:"permissions"`
	Users       []policyUser `json:"users"`
}

type policyUser struct {
	UserID      string `json:"user_id"`
	DisplayName string `json:"display_name"`
}

var userContext config.ContextKey = "policy_user"

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "policies"

	r.Get("/", list)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/", create)
	r.With(util.CheckEntityAccess(entity, "create")).Post("/default", createDefaults)

	r.Route("/{policy_id}", func(r chi.Router) {
		r.With(util.CheckEntityAccess(entity, "get")).Get("/", details)
		r.With(util.CheckEntityAccess(entity, "update")).Put("/", update)
		r.With(util.CheckEntityAccess(entity, "delete")).Delete("/", delete)
	})

	return r
}
