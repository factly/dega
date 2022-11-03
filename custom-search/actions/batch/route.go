package batch

import (
	"net/http"

	"github.com/go-chi/chi"
)

func Router() http.Handler {
	r := chi.NewRouter()
	r.Post("/add", add)
	r.Put("/update", update)
	r.Delete("/delete", remove)
	return r
}
