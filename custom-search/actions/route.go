package actions

import (
	"net/http"

	"github.com/factly/custom-search/actions/batch"
	"github.com/factly/x/loggerx"
	"github.com/go-chi/chi"
)

func RegisterRoutes() http.Handler {
	r := chi.NewRouter()
	r.Use(loggerx.Init())
	r.Post("/connect", connect)
	r.Post("/add", add)
	r.Post("/search", search)
	r.Delete("/delete", remove)
	r.Put("/update", update)
	r.Post("/reindex", reindex)
	r.Mount("/batch", batch.Router())
	r.Delete("/delete/all", deleteAll)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("status ok"))
	})
	return r
}
