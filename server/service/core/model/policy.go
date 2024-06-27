package model

import (
	"github.com/factly/dega-server/config"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// KetoPolicy model
type Permission struct {
	config.Base
	PolicyID uuid.UUID `gorm:"type:uuid;column:policy_id" json:"policy_id"`
	Action   string    `gorm:"column:action" json:"action"`
	Resource string    `gorm:"column:resource" json:"resource"`
}

// Permission model
type Policy struct {
	config.Base
	Name        string       `gorm:"column:name" json:"name"`
	Description string       `gorm:"column:description" json:"description"`
	Permissions []Permission `gorm:"one2many:policy_permissions;" json:"permissions"`
	SpaceID     uuid.UUID    `gorm:"type:uuid;column:space_id" json:"space_id"`
}

type PolicyUser struct {
	config.Base
	PolicyID uuid.UUID `gorm:"type:uuid;column:policy_id" json:"policy_id"`
	UserID   string    `gorm:"column:user_id" json:"user_id"`
}

var policyContext config.ContextKey = "policy_user"

// BeforeCreate hook
func (permission *Permission) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(policyContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	permission.CreatedByID = uID
	permission.UpdatedByID = uID
	permission.ID = uuid.New()
	return nil
}

func (policy *Policy) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(policyContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	policy.CreatedByID = uID
	policy.UpdatedByID = uID
	policy.ID = uuid.New()
	return nil
}

func (pu *PolicyUser) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(policyContext)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	pu.CreatedByID = uID
	pu.UpdatedByID = uID
	pu.ID = uuid.New()
	return nil
}
