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

type iFramelyRes struct {
	URL          string `json:"url,omitempty"`
	Type         string `json:"type,omitempty"`
	Version      string `json:"version,omitempty"`
	Title        string `json:"title,omitempty"`
	Author       string `json:"author,omitempty"`
	ProviderName string `json:"provider_name,omitempty"`
	Description  string `json:"description,omitempty"`
	ThumbnailURL string `json:"thumbnail_url,omitempty"`
}

// Router - Group of tag router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", details)

	return r
}
