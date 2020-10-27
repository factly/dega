package model

import (
	"database/sql"
	"errors"

	"gorm.io/gorm"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm/dialects/postgres"
)

// Space model
type Space struct {
	config.Base
	Name              string         `gorm:"column:name" json:"name"`
	Slug              string         `gorm:"column:slug" json:"slug"`
	SiteTitle         string         `gorm:"column:site_title" json:"site_title"`
	TagLine           string         `gorm:"column:tag_line" json:"tag_line"`
	Description       string         `gorm:"column:description" json:"description"`
	SiteAddress       string         `gorm:"column:site_address" json:"site_address"`
	LogoID            sql.NullInt64  `gorm:"column:logo_id;default:NULL" json:"logo_id"`
	Logo              *Medium        `json:"logo"`
	LogoMobileID      sql.NullInt64  `gorm:"column:logo_mobile_id;default:NULL" json:"logo_mobile_id"`
	LogoMobile        *Medium        `json:"logo_mobile"`
	FavIconID         sql.NullInt64  `gorm:"column:fav_icon_id;default:NULL" json:"fav_icon_id"`
	FavIcon           *Medium        `json:"fav_icon"`
	MobileIconID      sql.NullInt64  `gorm:"column:mobile_icon_id;default:NULL" json:"mobile_icon_id"`
	MobileIcon        *Medium        `json:"mobile_icon"`
	VerificationCodes postgres.Jsonb `gorm:"column:verification_codes" json:"verification_codes"`
	SocialMediaURLs   postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls"`
	ContactInfo       postgres.Jsonb `gorm:"column:contact_info" json:"contact_info"`
	OrganisationID    int            `gorm:"column:organisation_id" json:"organisation_id"`
}

// BeforeUpdate checks if all associated mediums are in same space
func (space *Space) BeforeUpdate(tx *gorm.DB) (e error) {
	if space.LogoID.Valid && space.LogoID.Int64 > 0 {

		medium := Medium{}
		medium.ID = uint(space.LogoID.Int64)

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("logo do not belong to same space")
		}
	}

	if space.LogoMobileID.Valid && space.LogoMobileID.Int64 > 0 {
		medium := Medium{}
		medium.ID = uint(space.LogoMobileID.Int64)

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("logo mobile do not belong to same space")
		}
	}

	if space.FavIconID.Valid && space.FavIconID.Int64 > 0 {
		medium := Medium{}
		medium.ID = uint(space.FavIconID.Int64)

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("fav icon do not belong to same space")
		}
	}

	if space.MobileIconID.Valid && space.MobileIconID.Int64 > 0 {
		medium := Medium{}
		medium.ID = uint(space.MobileIconID.Int64)

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("mobile do not belong to same space")
		}
	}
	return nil
}
