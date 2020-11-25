package model

import (
	"github.com/factly/dega-server/config"
	"gorm.io/gorm"
)

// Tag model
type Tag struct {
	config.Base
	Name        string  `gorm:"column:name" json:"name" validate:"required"`
	Slug        string  `gorm:"column:slug" json:"slug" validate:"required"`
	Description string  `gorm:"column:description" json:"description"`
	IsFeatured  bool    `gorm:"column:is_featured" json:"is_featured"`
	SpaceID     uint    `gorm:"column:space_id" json:"space_id"`
	Space       *Space  `json:"space,omitempty"`
	Posts       []*Post `gorm:"many2many:post_tags;" json:"posts"`
}

var tagUser config.ContextKey = "tag_user"

// BeforeCreate hook
func (tag *Tag) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(tagUser).(int)

	tag.CreatedBy = uint(userID)
	tag.UpdatedBy = uint(userID)
	return nil
}
