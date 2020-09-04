package models

import (
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
)

// Space model
type Space struct {
	ID                int            `json:"id"`
	CreatedDate       time.Time      `json:"created_date"`
	UpdatedDate       time.Time      `json:"updated_date"`
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
