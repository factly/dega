package model

import (
	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Request model
type Request struct {
	config.Base
	Title       string         `gorm:"column:title" json:"title"`
	Description postgres.Jsonb `gorm:"column:description" json:"description" swaggertype:"primitive,string"`
	Status      string         `gorm:"column:status" json:"status"`
}

// OrganisationPermissionRequest model
type OrganisationPermissionRequest struct {
	Request
	OrganisationID uint  `gorm:"column:organisation_id" json:"organisation_id"`
	Spaces         int64 `gorm:"column:spaces" json:"spaces"`
}

// SpacePermissionRequest model
type SpacePermissionRequest struct {
	Request
	Media     int64  `gorm:"column:media" json:"media"`
	Posts     int64  `gorm:"column:posts" json:"posts"`
	FactCheck bool   `gorm:"column:fact_check" json:"fact_check"`
	SpaceID   uint   `gorm:"column:space_id" json:"space_id"`
	Space     *Space `gorm:"foreignKey:space_id" json:"space,omitempty"`
}

var requestUser config.ContextKey = "request_user"

// BeforeCreate hook
func (opr *OrganisationPermissionRequest) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(requestUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	opr.CreatedByID = uint(uID)
	opr.UpdatedByID = uint(uID)
	return nil
}

// BeforeCreate hook
func (spr *SpacePermissionRequest) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(requestUser)

	if userID == nil {
		return nil
	}
	uID := userID.(int)

	spr.CreatedByID = uint(uID)
	spr.UpdatedByID = uint(uID)
	return nil
}
