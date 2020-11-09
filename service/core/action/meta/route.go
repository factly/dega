package meta

import (
	"github.com/go-chi/chi"
)

type metadata struct {
	Success uint `json:"success"`
	Meta    meta `json:"meta"`
}

type meta struct {
	Title       string                 `json:"title"`
	SiteName    string                 `json:"site_name"`
	Description string                 `json:"description"`
	Image       map[string]interface{} `json:"image"`
}

// Router - Group of tag router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", details)

	return r
}
