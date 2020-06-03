package policy

import "github.com/go-chi/chi"

type permission struct {
	Resource string   `json:"resource"`
	Actions  []string `json:"actions"`
}

type policy struct {
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Permissions []permission `json:"permissions"`
	Users       []string     `json:"users"`
}

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/", list)
	r.Route("/{policy_id}", func(r chi.Router) {
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r
}
