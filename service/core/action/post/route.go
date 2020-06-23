package post

import (
	"errors"
	"time"

	"github.com/factly/dega-server/service/core/model"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm"
)

// post request body
type post struct {
	Title            string    `json:"title" validate:"required"`
	Subtitle         string    `json:"subtitle" validate:"required"`
	Slug             string    `json:"slug"`
	Status           string    `json:"status" validate:"required"`
	Excerpt          string    `json:"excerpt" validate:"required"`
	Description      string    `json:"description" validate:"required"`
	Updates          string    `json:"updates" `
	IsFeatured       bool      `json:"is_featured"`
	IsSticky         bool      `json:"is_sticky"`
	IsHighlighted    bool      `json:"is_highlighted"`
	FeaturedMediumID uint      `json:"featured_medium_id"`
	FormatID         uint      `json:"format_id" validate:"required"`
	PublishedDate    time.Time `json:"published_date" validate:"required"`
	SpaceID          uint      `json:"space_id" validate:"required"`
	CategoryIDS      []uint    `json:"category_ids"`
	TagIDS           []uint    `json:"tag_ids"`
}

type postData struct {
	model.Post
	Categories []model.Category `json:"categories"`
	Tags       []model.Tag      `json:"tags"`
}

// CheckSpace - validation for medium, format, categories & tags
func (p *post) CheckSpace(tx *gorm.DB) (e error) {
	medium := model.Medium{}
	medium.ID = p.FeaturedMediumID

	err := tx.Model(&model.Medium{}).Where(model.Medium{
		SpaceID: p.SpaceID,
	}).First(&medium).Error

	if err != nil {
		return errors.New("medium do not belong to same space")
	}

	format := model.Format{}
	format.ID = p.FormatID

	err = tx.Model(&model.Format{}).Where(model.Format{
		SpaceID: p.SpaceID,
	}).First(&format).Error

	if err != nil {
		return errors.New("format do not belong to same space")
	}

	categories := []model.Category{}
	err = tx.Model(&model.Category{}).Where(model.Category{
		SpaceID: p.SpaceID,
	}).Where(p.CategoryIDS).Find(&categories).Error

	if err != nil || (len(p.CategoryIDS) != len(categories)) {
		return errors.New("some categories do not belong to same space")
	}

	tags := []model.Tag{}
	err = tx.Model(&model.Tag{}).Where(model.Tag{
		SpaceID: p.SpaceID,
	}).Where(p.TagIDS).Find(&tags).Error

	if err != nil || (len(p.TagIDS) != len(tags)) {
		return errors.New("some tags do not belong to same space")
	}

	return err
}

// Router - Group of post router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{post_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
