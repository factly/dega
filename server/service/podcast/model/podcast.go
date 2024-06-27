package model

import (
	"errors"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Podcast model
type Podcast struct {
	config.Base
	Title             string           `gorm:"column:title" json:"title"`
	Slug              string           `gorm:"column:slug" json:"slug"`
	Description       postgres.Jsonb   `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	DescriptionHTML   string           `gorm:"column:description_html" json:"description_html,omitempty"`
	Language          string           `gorm:"column:language" json:"language"`
	Categories        []model.Category `gorm:"many2many:podcast_categories;" json:"categories"`
	PrimaryCategoryID *uuid.UUID       `gorm:"type:uuid;column:primary_category_id;default:NULL" json:"primary_category_id" sql:"DEFAULT:NULL"`
	PrimaryCategory   *model.Category  `gorm:"foreignKey:primary_category_id" json:"primary_category"`
	MediumID          *uuid.UUID       `gorm:"type:uuid;column:medium_id;default:NULL" json:"medium_id"`
	Medium            *model.Medium    `json:"medium"`
	HeaderCode        string           `gorm:"column:header_code" json:"header_code"`
	FooterCode        string           `gorm:"column:footer_code" json:"footer_code"`
	MetaFields        postgres.Jsonb   `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	Meta              postgres.Jsonb   `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	SpaceID           uuid.UUID        `gorm:"type:uuid;column:space_id" json:"space_id"`
}

// BeforeSave - validation for medium
func (podcast *Podcast) BeforeSave(tx *gorm.DB) (e error) {
	if podcast.MediumID != nil && *podcast.MediumID != uuid.Nil {
		medium := model.Medium{}
		medium.ID = *podcast.MediumID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: podcast.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}

	if podcast.PrimaryCategoryID != nil && *podcast.PrimaryCategoryID != uuid.Nil {
		category := model.Category{}
		category.ID = *podcast.PrimaryCategoryID

		err := tx.Model(&model.Category{}).Where(model.Category{
			SpaceID: podcast.SpaceID,
		}).First(&category).Error

		if err != nil {
			return errors.New("primary category do not belong to same space")
		}
	}

	for _, category := range podcast.Categories {
		if category.SpaceID != podcast.SpaceID {
			return errors.New("some categories do not belong to same space")
		}
	}

	return nil
}

var podcastUser config.ContextKey = "podcast_user"

// BeforeCreate hook
func (podcast *Podcast) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(podcastUser)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	podcast.CreatedByID = uID
	podcast.UpdatedByID = uID
	podcast.ID = uuid.New()
	return nil
}
