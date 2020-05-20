package rating

import "github.com/go-chi/chi"

// rating model
type rating struct {
	Name         string `gorm:"column:name" json:"name"`
	Slug         string `gorm:"column:slug" json:"slug"`
	Description  string `gorm:"column:description" json:"description"`
	NumericValue string `gorm:"column:numeric_value" json:"numeric_value"`
	MediumID     uint   `gorm:"column:medium_id" json:"medium_id"`
	SpaceID      uint   `gorm:"column:space_id" json:"space_id"`
}

// Router - Group of rating router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{rating_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
