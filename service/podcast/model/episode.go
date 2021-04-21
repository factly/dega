package model

import (
	"errors"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Episode model
type Episode struct {
	config.Base
	Title           string         `gorm:"column:title" json:"title"`
	Slug            string         `gorm:"column:slug" json:"slug"`
	Season          int            `gorm:"column:season" json:"season"`
	Episode         int            `gorm:"column:episode" json:"episode"`
	AudioURL        string         `gorm:"column:audio_url" json:"audio_url"`
	PodcastID       *uint          `gorm:"column:podcast_id" json:"podcast_id"`
	Podcast         Podcast        `json:"podcast"`
	Description     postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	HTMLDescription string         `gorm:"column:html_description" json:"html_description,omitempty"`
	PublishedDate   *time.Time     `gorm:"column:published_date" json:"published_date" sql:"DEFAULT:NULL"`
	MediumID        *uint          `gorm:"column:medium_id;default:NULL" json:"medium_id"`
	Medium          *model.Medium  `json:"medium"`
	SpaceID         uint           `gorm:"column:space_id" json:"space_id"`
	Space           *model.Space   `json:"space,omitempty"`
}

// EpisodeAuthor model
type EpisodeAuthor struct {
	config.Base
	AuthorID  uint `gorm:"column:author_id" json:"author_id"`
	EpisodeID uint `gorm:"column:episode_id" json:"episode_id"`
}

// BeforeSave - validation for medium & podcast
func (episode *Episode) BeforeSave(tx *gorm.DB) (e error) {
	if episode.MediumID != nil && *episode.MediumID > 0 {
		medium := model.Medium{}
		medium.ID = *episode.MediumID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: episode.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}
	if episode.PodcastID != nil && *episode.PodcastID > 0 {
		podcast := Podcast{}
		podcast.ID = *episode.PodcastID

		err := tx.Model(&Podcast{}).Where(Podcast{
			SpaceID: episode.SpaceID,
		}).First(&podcast).Error

		if err != nil {
			return errors.New("podcast do not belong to same space")
		}
	}
	return nil
}

var episodeUser config.ContextKey = "episode_user"

// BeforeCreate hook
func (episode *Episode) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(episodeUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	episode.CreatedByID = uint(uID)
	episode.UpdatedByID = uint(uID)
	return nil
}
