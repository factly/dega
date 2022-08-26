package user

import (
	"github.com/go-chi/chi"
)

func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)
	r.Delete("/{user_id}", delete)
	return r
}
