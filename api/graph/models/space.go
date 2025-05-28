package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm/dialects/postgres"
	"gorm.io/gorm"
)

// Space model
type Space struct {
	ID                uuid.UUID       `gorm:"primary_key" json:"id"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
	DeletedAt         *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name              string          `gorm:"column:name" json:"name"`
	Slug              string          `gorm:"column:slug" json:"slug"`
	SiteTitle         string          `gorm:"column:site_title" json:"site_title"`
	TagLine           string          `gorm:"column:tag_line" json:"tag_line"`
	Description       string          `gorm:"column:description" json:"description"`
	SiteAddress       string          `gorm:"column:site_address" json:"site_address"`
	LogoID            uuid.UUID       `gorm:"column:logo_id" json:"logo_id" sql:"DEFAULT:NULL"`
	Logo              *Medium         `gorm:"foreignkey:logo_id;association_foreignkey:id" json:"logo"`
	LogoMobileID      uuid.UUID       `gorm:"column:logo_mobile_id" json:"logo_mobile_id" sql:"DEFAULT:NULL"`
	LogoMobile        *Medium         `gorm:"foreignkey:logo_mobile_id;association_foreignkey:id" json:"logo_mobile"`
	FavIconID         uuid.UUID       `gorm:"column:fav_icon_id" json:"fav_icon_id" sql:"DEFAULT:NULL"`
	FavIcon           *Medium         `gorm:"foreignkey:fav_icon_id;association_foreignkey:id" json:"fav_icon"`
	MobileIconID      uuid.UUID       `gorm:"column:mobile_icon_id" json:"mobile_icon_id" sql:"DEFAULT:NULL"`
	MobileIcon        *Medium         `gorm:"foreignkey:mobile_icon_id;association_foreignkey:id" json:"mobile_icon"`
	VerificationCodes postgres.Jsonb  `gorm:"column:verification_codes" json:"verification_codes"`
	SocialMediaURLs   postgres.Jsonb  `gorm:"column:social_media_urls" json:"social_media_urls"`
	ContactInfo       postgres.Jsonb  `gorm:"column:contact_info" json:"contact_info"`
	HeaderCode        string          `gorm:"column:header_code" json:"header_code"`
	FooterCode        string          `gorm:"column:footer_code" json:"footer_code"`
	MetaFields        postgres.Jsonb  `gorm:"column:meta_fields" json:"meta_fields"`
}

type SpaceToken struct {
	ID          uuid.UUID  `gorm:"primary_key" json:"id"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at"`
	SpaceID     uuid.UUID  `json:"space_id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Token       string     `json:"token"`
}

type SpaceUser struct {
	ID        uuid.UUID  `gorm:"primary_key" json:"id"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
	SpaceID   uuid.UUID  `gorm:"type:uuid;column:space_id" json:"space_id"`
	UserID    string     `gorm:"column:user_id" json:"user_id"`
}
