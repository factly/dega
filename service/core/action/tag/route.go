package tag

import "github.com/go-chi/chi"

// tag model
type tag struct {
	Name           string `gorm:"column:name"`
	Slug           string `gorm:"column:slug"`
	Description    string `gorm:"column:description"`
	ProfileImageID uint   `gorm:"column:profile_image_id"`
	CreatedByID    uint   `gorm:"column:created_by_id"`
	SpaceID        uint   `gorm:"column:space_id"`
	MetaFields     string `gorm:"column:meta_fields"`
}

// Router - Group of currency router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
