package model

import (
	"errors"

	"github.com/factly/dega-server/config"
	"github.com/jinzhu/gorm"
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
	LogoID            uint           `gorm:"column:logo_id" json:"logo_id" sql:"DEFAULT:NULL"`
	Logo              *Medium        `gorm:"foreignkey:logo_id;association_foreignkey:id" json:"logo"`
	LogoMobileID      uint           `gorm:"column:logo_mobile_id" json:"logo_mobile_id" sql:"DEFAULT:NULL"`
	LogoMobile        *Medium        `gorm:"foreignkey:logo_mobile_id;association_foreignkey:id" json:"logo_mobile"`
	FavIconID         uint           `gorm:"column:fav_icon_id" json:"fav_icon_id" sql:"DEFAULT:NULL"`
	FavIcon           *Medium        `gorm:"foreignkey:fav_icon_id;association_foreignkey:id" json:"fav_icon"`
	MobileIconID      uint           `gorm:"column:mobile_icon_id" json:"mobile_icon_id" sql:"DEFAULT:NULL"`
	MobileIcon        *Medium        `gorm:"foreignkey:mobile_icon_id;association_foreignkey:id" json:"mobile_icon"`
	VerificationCodes postgres.Jsonb `gorm:"column:verification_codes" json:"verification_codes"`
	SocialMediaURLs   postgres.Jsonb `gorm:"column:social_media_urls" json:"social_media_urls"`
	ContactInfo       postgres.Jsonb `gorm:"column:contact_info" json:"contact_info"`
	OrganisationID    int            `gorm:"column:organisation_id" json:"organisation_id"`
}

// BeforeUpdate checks if all associated mediums are in same space
func (space *Space) BeforeUpdate(tx *gorm.DB) (e error) {
	if space.LogoID > 0 {

		medium := Medium{}
		medium.ID = space.LogoID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("logo do not belong to same space")
		}
	}

	if space.LogoMobileID > 0 {
		medium := Medium{}
		medium.ID = space.LogoMobileID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("logo mobile do not belong to same space")
		}
	}

	if space.FavIconID > 0 {
		medium := Medium{}
		medium.ID = space.FavIconID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("fav icon do not belong to same space")
		}
	}

	if space.MobileIconID > 0 {
		medium := Medium{}
		medium.ID = space.MobileIconID

		err := tx.Model(&Medium{}).Where(Medium{
			SpaceID: space.ID,
		}).First(&medium).Error

		if err != nil {
			return errors.New("mobile do not belong to same space")
		}
	}
	return nil
}
