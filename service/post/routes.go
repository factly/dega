package post

import (
	"github.com/factly/dega-templates/model"
	"github.com/go-chi/chi"
)

type postData struct {
	model.Post
	Authors []model.Author `json:"authors"`
	Claims  []model.Claim  `json:"claims"`
}

// Router posts router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/{post_id}", page)

	return r
}
