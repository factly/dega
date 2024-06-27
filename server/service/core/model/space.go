package model

import (
	"errors"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Space model
type Space struct {
	config.Base
	Name              string         `gorm:"column:name" json:"name"`
	Slug              string         `gorm:"column:slug" json:"slug"`
	Description       string         `gorm:"column:description" json:"description"`
	SiteTitle         string         `gorm:"site_title" json:"site_title"`
	TagLine           string         `gorm:"tag_line" json:"tag_line"`
	SiteAddress       string         `gorm:"site_address" json:"site_address"`
	LogoID            *uuid.UUID     `gorm:"type:uuid;column:logo_id;default:NULL" json:"logo_id"`
	Logo              *Medium        `gorm:"foreignKey:logo_id" json:"logo"`
	LogoMobileID      *uuid.UUID     `gorm:"type:uuid;column:logo_mobile_id;default:NULL" json:"logo_mobile_id"`
	LogoMobile        *Medium        `gorm:"foreignKey:logo_mobile_id" json:"logo_mobile"`
	FavIconID         *uuid.UUID     `gorm:"type:uuid;column:fav_icon_id;default:NULL" json:"fav_icon_id"`
	FavIcon           *Medium        `gorm:"foreignKey:fav_icon_id" json:"fav_icon"`
	MobileIconID      *uuid.UUID     `gorm:"type:uuid;column:mobile_icon_id;default:NULL" json:"mobile_icon_id"`
	MobileIcon        *Medium        `gorm:"foreignKey:mobile_icon_id" json:"mobile_icon"`
	VerificationCodes postgres.Jsonb `gorm:"column:verification_codes" json:"verification_codes" swaggertype:"primitive,string"`
	SocialMediaURLs   postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls" swaggertype:"primitive,string"`
	ContactInfo       postgres.Jsonb `gorm:"column:contact_info" json:"contact_info" swaggertype:"primitive,string"`
	Analytics         postgres.Jsonb `gorm:"column:analytics" json:"analytics" swaggertype:"primitive,string"`
	HeaderCode        string         `gorm:"column:header_code" json:"header_code"`
	FooterCode        string         `gorm:"column:footer_code" json:"footer_code"`
	MetaFields        postgres.Jsonb `gorm:"column:meta_fields" json:"meta_fields" swaggertype:"primitive,string"`
	OrganisationID    string         `gorm:"column:organisation_id" json:"organisation_id"`
}

type SpaceUser struct {
	config.Base
	SpaceID uuid.UUID `gorm:"type:uuid;column:space_id" json:"space_id"`
	UserID  string    `gorm:"column:user_id" json:"user_id"`
}

type SpaceToken struct {
	config.Base
	Name        string    `gorm:"column:name" json:"name"`
	Description string    `gorm:"column:description" json:"description"`
	SpaceID     uuid.UUID `gorm:"type:uuid;column:space_id" json:"space_id"`
	Token       string    `gorm:"column:token" json:"token"`
}

var spaceUser config.ContextKey = "space_user"

// BeforeCreate hook
func (space *Space) BeforeCreate(tx *gorm.DB) error {
	ctx := tx.Statement.Context
	userID := ctx.Value(spaceUser)

	if userID == nil {
		return nil
	}
	uID := userID.(string)

	space.CreatedByID = uID
	space.UpdatedByID = uID
	space.ID = uuid.New()
	return nil
}

func (space *Space) BeforeUpdate(tx *gorm.DB) (e error) {
	if space.LogoID != nil && *space.LogoID != uuid.Nil {

		medium := Medium{}
		medium.ID = *space.LogoID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("logo do not belong to same space")
		}
	}

	if space.LogoMobileID != nil && *space.LogoMobileID != uuid.Nil {
		medium := Medium{}
		medium.ID = *space.LogoMobileID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("logo mobile do not belong to same space")
		}
	}

	if space.FavIconID != nil && *space.FavIconID != uuid.Nil {
		medium := Medium{}
		medium.ID = *space.FavIconID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("fav icon do not belong to same space")
		}
	}

	if space.MobileIconID != nil && *space.MobileIconID != uuid.Nil {
		medium := Medium{}
		medium.ID = *space.MobileIconID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("mobile icon do not belong to same space")
		}
	}
	return nil
}
