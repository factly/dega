package tokens

import (
	"github.com/factly/dega-server/config"
	"github.com/go-chi/chi"
)

type spaceToken struct {
	Name        string `gorm:"column:name" json:"name"`
	Description string `gorm:"column:description" json:"description"`
}

var userContext config.ContextKey = "space_user"

func Router() chi.Router {
	r := chi.NewRouter()
	r.Get("/", list)
	r.Post("/", create)
	r.Delete("/{token_id}", delete)

	return r
}
