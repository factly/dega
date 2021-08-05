package model

import (
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Video model
type Video struct {
	config.Base
	URL           string           `gorm:"column:url;not null" json:"url"`
	Title         string           `gorm:"column:title;not null" json:"title"`
	Slug          string           `gorm:"column:slug" json:"slug"`
	Summary       string           `gorm:"column:summary" json:"summary"`
	VideoType     string           `gorm:"column:video_type" json:"video_type"`
	SpaceID       uint             `gorm:"column:space_id" json:"space_id"`
	Status        string           `gorm:"status" json:"status"`
	TotalDuration int              `gorm:"total_duration" json:"total_duration"`
	ThumbnailURL  string           `gorm:"column:thumbnail_url" json:"thumbnail_url"`
	PublishedDate *time.Time       `gorm:"column:published_date" json:"published_date"`
	Tags          []model.Tag      `gorm:"many2many:video_tags;" json:"tags"`
	Categories    []model.Category `gorm:"many2many:video_categories;" json:"categories"`
	Schemas       postgres.Jsonb   `gorm:"column:schemas" json:"schemas" swaggertype:"primitive,string"`
}

// VideoAuthor model
type VideoAuthor struct {
	config.Base
	AuthorID uint `gorm:"column:author_id" json:"author_id"`
	VideoID  uint `gorm:"column:video_id" json:"video_id"`
}

var videoUser config.ContextKey = "video_user"

// BeforeCreate hook
func (video *Video) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(videoUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	video.CreatedByID = uint(uID)
	video.UpdatedByID = uint(uID)
	return nil
}
