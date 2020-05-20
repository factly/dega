package tag

import "github.com/go-chi/chi"

// tag model
type tag struct {
	Name        string `gorm:"column:name"`
	Slug        string `gorm:"column:slug"`
	Description string `gorm:"column:description"`
	SpaceID     uint   `gorm:"column:space_id"`
}

// Router - Group of tag router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{tag_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
