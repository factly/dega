package user

import "github.com/go-chi/chi"

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Get("/permissions", allpermissions)

	return r
}
