package model

import (
	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Space model
type Space struct {
	config.Base
	Name            string         `gorm:"column:name" json:"name"`
	Slug            string         `gorm:"column:slug" json:"slug"`
	Description     string         `gorm:"column:description" json:"description"`
	MetaFields      postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	SpaceSettingsID uint           `gorm:"column:space_settings_id;default:NULL" json:"space_settings_id"`
	SpaceSettings   *SpaceSettings `gorm:"foreignKey:space_settings_id" json:"space_settings"`
	OrganisationID  int            `gorm:"column:organisation_id" json:"organisation_id"`
	ApplicationID   uint           `gorm:"column:application_id" json:"application_id"`
}

// SpacePermission model
type SpacePermission struct {
	config.Base
	FactCheck bool  `gorm:"column:fact_check" json:"fact_check"`
	SpaceID   uint  `gorm:"column:space_id" json:"space_id"`
	Media     int64 `gorm:"column:media" json:"media"`
	Posts     int64 `gorm:"column:posts" json:"posts"`
	Podcast   bool  `gorm:"column:podcast" json:"podcast"`
	Episodes  int64 `gorm:"column:episodes" json:"episodes"`
	Videos    int64 `gorm:"column:videos" json:"videos"`
}

type KavachSpace struct {
	config.Base
	Name           string         `json:"name"`
	Slug           string         `json:"slug"`
	Description    string         `json:"description"`
	ApplicationID  uint           `json:"application_id"`
	OrganisationID uint           `json:"organisation_id"`
	MetaFields     postgres.Jsonb `json:"meta_fields"`
}

var spaceUser config.ContextKey = "space_user"
var spacePermissionUser config.ContextKey = "space_perm_user"

// BeforeCreate hook
func (space *Space) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(spaceUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	space.CreatedByID = uint(uID)
	space.UpdatedByID = uint(uID)
	return nil
}

// BeforeCreate hook
func (sp *SpacePermission) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(spacePermissionUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	sp.CreatedByID = uint(uID)
	sp.UpdatedByID = uint(uID)
	return nil
}
