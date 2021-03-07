package model

import (
	"errors"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Podcast model
type Podcast struct {
	config.Base
	Title             string           `gorm:"column:title" json:"title"`
	Slug              string           `gorm:"column:slug" json:"slug"`
	Description       postgres.Jsonb   `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	Language          string           `gorm:"column:language" json:"language"`
	Episodes          []Episode        `gorm:"many2many:podcast_episodes;" json:"episodes"`
	Categories        []model.Category `gorm:"many2many:podcast_categories;" json:"categories"`
	PrimaryCategoryID *uint            `gorm:"column:primary_category_id;default:NULL" json:"primary_category_id" sql:"DEFAULT:NULL"`
	PrimaryCategory   *model.Category  `gorm:"foreignKey:primary_category_id" json:"primary_category"`
	MediumID          *uint            `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium            *model.Medium    `json:"medium"`
	SpaceID           uint             `gorm:"column:space_id" json:"space_id"`
	Space             *model.Space     `json:"space,omitempty"`
}

// BeforeSave - validation for medium
func (podcast *Podcast) BeforeSave(tx *gorm.DB) (e error) {
	if podcast.MediumID != nil && *podcast.MediumID > 0 {
		medium := model.Medium{}
		medium.ID = *podcast.MediumID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: podcast.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
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
	uID := userID.(int)

	podcast.CreatedByID = uint(uID)
	podcast.UpdatedByID = uint(uID)
	return nil
}
