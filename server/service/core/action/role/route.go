package role

import (
	//"github.com/factly/dega-server/config"
	"github.com/go-chi/chi"
	//"github.com/jinzhu/gorm/dialects/postgres"
)

type spaceRole struct {
	Name        string `gorm:"column:name" json:"name"`
	Description string `gorm:"column:description" json:"description"`
	Slug        string `gorm:"column:slug" json:"slug"`
}

func Router() chi.Router {
	r := chi.NewRouter()

	//r.Post("/", create)
	//r.Get("/", my)
	r.Get("/", details)
	r.Post("/", create)
	r.Put("/", update)
	r.Route("/{role_id}", func(r chi.Router) {
		r.Post("/users", createUserRole)
	})
	// r.Route("/{space_id}", func(r chi.Router) {

	//r.Put("/", update)
	//r.Delete("/", delete)
	//})

	return r
}
