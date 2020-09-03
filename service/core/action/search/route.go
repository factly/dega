package search

import "github.com/go-chi/chi"

type searchQuery struct {
	Query        string   `json:"q" validate:"required"`
	Limit        int64    `json:"limit"`
	Filters      string   `json:"filters"`
	FacetFilters []string `json:"facetFilters"`
}

// Router - Group of search router
func Router() chi.Router {
	r := chi.NewRouter()
	r.Post("/", search)
	return r
}
