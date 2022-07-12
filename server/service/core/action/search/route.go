package search

import "github.com/go-chi/chi"

type searchQuery struct {
	Query        string   `json:"q"`
	Limit        int64    `json:"limit" validate:"lte=20"`
}

// Router - Group of search router
func Router() chi.Router {
	r := chi.NewRouter()
	r.Post("/", list)
	return r
}
