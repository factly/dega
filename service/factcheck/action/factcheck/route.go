package factcheck

import (
	"errors"
	"time"

	coreModel "github.com/factly/dega-server/service/core/model"
	factcheckModel "github.com/factly/dega-server/service/factcheck/model"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// factcheck request body
type factcheck struct {
	Title            string         `json:"title" validate:"required,min=3,max=50"`
	Subtitle         string         `json:"subtitle"`
	Slug             string         `json:"slug"`
	Status           string         `json:"status"`
	Excerpt          string         `json:"excerpt" validate:"required,min=3,max=100"`
	Description      postgres.Jsonb `json:"description"`
	Updates          string         `json:"updates"`
	IsFeatured       bool           `json:"is_featured"`
	IsSticky         bool           `json:"is_sticky"`
	IsHighlighted    bool           `json:"is_highlighted"`
	FeaturedMediumID uint           `json:"featured_medium_id"`
	PublishedDate    time.Time      `json:"published_date"`
	SpaceID          uint           `json:"space_id"`
	CategoryIDS      []uint         `json:"category_ids"`
	TagIDS           []uint         `json:"tag_ids"`
	ClaimIDS         []uint         `json:"claim_ids"`
	AuthorIDS        []uint         `json:"author_ids"`
}

type factcheckData struct {
	factcheckModel.Factcheck
	Categories []coreModel.Category   `json:"categories"`
	Tags       []coreModel.Tag        `json:"tags"`
	Claims     []factcheckModel.Claim `json:"claims"`
	Authors    []coreModel.Author     `json:"authors"`
}

// CheckSpace - validation for medium, format, categories & tags
func (p *factcheck) CheckSpace(tx *gorm.DB) (e error) {
	medium := coreModel.Medium{}
	medium.ID = p.FeaturedMediumID

	err := tx.Model(&coreModel.Medium{}).Where(coreModel.Medium{
		SpaceID: p.SpaceID,
	}).First(&medium).Error

	if err != nil {
		return errors.New("medium do not belong to same space")
	}

	categories := []coreModel.Category{}
	err = tx.Model(&coreModel.Category{}).Where(coreModel.Category{
		SpaceID: p.SpaceID,
	}).Where(p.CategoryIDS).Find(&categories).Error

	if err != nil || (len(p.CategoryIDS) != len(categories)) {
		return errors.New("some categories do not belong to same space")
	}

	tags := []coreModel.Tag{}
	err = tx.Model(&coreModel.Tag{}).Where(coreModel.Tag{
		SpaceID: p.SpaceID,
	}).Where(p.TagIDS).Find(&tags).Error

	if err != nil || (len(p.TagIDS) != len(tags)) {
		return errors.New("some tags do not belong to same space")
	}

	claims := []factcheckModel.Claim{}
	err = tx.Model(&factcheckModel.Claim{}).Where(factcheckModel.Claim{
		SpaceID: p.SpaceID,
	}).Where(p.ClaimIDS).Find(&claims).Error

	if err != nil || (len(p.ClaimIDS) != len(claims)) {
		return errors.New("some claims do not belong to same space")
	}

	return err
}

// Router - Group of factcheck router
func Router() chi.Router {
	r := chi.NewRouter()

	r.Get("/", list)
	r.Post("/", create)

	r.Route("/{factcheck_id}", func(r chi.Router) {
		r.Get("/", details)
		r.Put("/", update)
		r.Delete("/", delete)
	})

	return r

}
