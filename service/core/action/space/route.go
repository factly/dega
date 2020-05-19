package space

import "github.com/go-chi/chi"

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Post("/", create)
	r.Get("/my", my)

	return r
}
