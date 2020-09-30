package google

import "github.com/go-chi/chi"

// Router -  google fact checks router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)

	return r

}
