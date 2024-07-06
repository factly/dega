package model

import (
	"errors"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/google/uuid"
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
	PodcastID       *uuid.UUID     `gorm:"type:uuid;column:podcast_id" json:"podcast_id"`
	Podcast         *Podcast       `gorm:"foreignKey:podcast_id" json:"podcast"`
	Description     postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	DescriptionHTML string         `gorm:"column:description_html" json:"description_html,omitempty"`
	PublishedDate   *time.Time     `gorm:"column:published_date" json:"published_date" sql:"DEFAULT:NULL"`
	MediumID        *uuid.UUID     `gorm:"type:uuid;column:medium_id;default:NULL" json:"medium_id"`
	Medium          *model.Medium  `gorm:"foreignKey:medium_id" json:"medium"`
	MetaFields      postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	Meta            postgres.Jsonb `gorm:"column:meta" json:"meta" swaggertype:"primitive,string"`
	HeaderCode      string         `gorm:"column:header_code" json:"header_code"`
	FooterCode      string         `gorm:"column:footer_code" json:"footer_code"`
	SpaceID         uuid.UUID      `gorm:"type:uuid;column:space_id" json:"space_id"`
}

// EpisodeAuthor model
type EpisodeAuthor struct {
	config.Base
	AuthorID  string    `gorm:"type:uuid;column:author_id" json:"author_id"`
	EpisodeID uuid.UUID `gorm:"type:uuid;column:episode_id" json:"episode_id"`
}

// BeforeSave - validation for medium & podcast
func (episode *Episode) BeforeSave(tx *gorm.DB) (e error) {
	if episode.MediumID != nil && *episode.MediumID != uuid.Nil {
		medium := model.Medium{}
		medium.ID = *episode.MediumID

		err := tx.Model(&model.Medium{}).Where(model.Medium{
			SpaceID: episode.SpaceID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("medium do not belong to same space")
		}
	}
	if episode.PodcastID != nil && *episode.PodcastID != uuid.Nil {
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
	uID := userID.(string)

	episode.CreatedByID = uID
	episode.UpdatedByID = uID
	episode.ID = uuid.New()
	return nil
}

func (ea *EpisodeAuthor) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(episodeUser)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	ea.CreatedByID = uID
	ea.UpdatedByID = uID
	ea.ID = uuid.New()
	return nil
}
