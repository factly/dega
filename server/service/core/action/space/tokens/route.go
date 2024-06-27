package tokens

import (
	"github.com/factly/dega-server/config"
	"github.com/go-chi/chi"
	"github.com/google/uuid"
)

type spaceToken struct {
	config.Base
	Name        string    `gorm:"column:name" json:"name"`
	Description string    `gorm:"column:description" json:"description"`
	SpaceID     uuid.UUID `gorm:"column:space_id" json:"space_id"`
}

func Router() chi.Router {
	r := chi.NewRouter()
	r.Get("/", list)
	r.Post("/", create)
	r.Delete("/{token_id}", delete)

	return r
}
