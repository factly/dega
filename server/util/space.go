package util

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	httpx "github.com/factly/dega-server/util/http"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

type Space struct {
	ID                uint            `json:"id"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
	DeletedAt         *gorm.DeletedAt `json:"deleted_at"`
	CreatedByID       uint            `json:"created_by_id"`
	UpdatedByID       uint            `json:"updated_by_id"`
	Name              string          `json:"name" validate:"required,min=3,max=50"`
	Slug              string          `json:"slug"`
	SiteTitle         string          `json:"site_title"`
	TagLine           string          `json:"tag_line"`
	Description       string          `json:"description"`
	SiteAddress       string          `json:"site_address"`
	LogoID            *uint           `json:"logo_id"`
	Logo              *model.Medium   `gorm:"foreignKey:logo_id" json:"logo"`
	LogoMobileID      *uint           `json:"logo_mobile_id"`
	LogoMobile        *model.Medium   `gorm:"foreignKey:logo_mobile_id" json:"logo_mobile"`
	FavIconID         *uint           `json:"fav_icon_id"`
	FavIcon           *model.Medium   `gorm:"foreignKey:fav_icon_id" json:"fav_icon"`
	MobileIconID      *uint           `json:"mobile_icon_id"`
	MobileIcon        *model.Medium   `gorm:"foreignKey:mobile_icon_id" json:"mobile_icon"`
	VerificationCodes postgres.Jsonb  `json:"verification_codes" swaggertype:"primitive,string"`
	SocialMediaURLs   postgres.Jsonb  `json:"social_media_urls" swaggertype:"primitive,string"`
	ContactInfo       postgres.Jsonb  `json:"contact_info" swaggertype:"primitive,string"`
	Analytics         postgres.Jsonb  `json:"analytics" swaggertype:"primitive,string"`
	HeaderCode        string          `json:"header_code"`
	FooterCode        string          `json:"footer_code"`
	MetaFields        postgres.Jsonb  `json:"meta_fields" swaggertype:"primitive,string"`
	OrganisationID    int             `json:"organisation_id" validate:"required"`
	ApplicationID     uint            `json:"application_id"`
}

func GetSpacefromKavach(userID, orgID, spaceID uint) (*Space, error) {
	applicationID, err := GetApplicationID(uint(userID), "dega")
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequest("GET", viper.GetString("kavach_url")+fmt.Sprintf("/organisations/%d/applications/", orgID)+fmt.Sprintf("%d", applicationID)+"/spaces/"+fmt.Sprintf("%d", spaceID), nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("X-User", fmt.Sprintf("%d", userID))
	req.Header.Set("Content-Type", "application/json")

	client := httpx.CustomHttpClient()
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	spaceObjectfromKavach := &model.KavachSpace{}
	err = json.NewDecoder(resp.Body).Decode(spaceObjectfromKavach)
	if err != nil {
		return nil, err
	}

	spaceObjectforDega := Space{}
	spaceObjectforDega.ID = spaceObjectfromKavach.ID
	spaceObjectforDega.CreatedAt = spaceObjectfromKavach.CreatedAt
	spaceObjectforDega.UpdatedAt = spaceObjectfromKavach.UpdatedAt
	spaceObjectforDega.DeletedAt = spaceObjectfromKavach.DeletedAt
	spaceObjectforDega.CreatedByID = spaceObjectfromKavach.CreatedByID
	spaceObjectforDega.UpdatedByID = spaceObjectfromKavach.UpdatedByID
	spaceObjectforDega.Name = spaceObjectfromKavach.Name
	spaceObjectforDega.Slug = spaceObjectfromKavach.Slug
	spaceObjectforDega.Description = spaceObjectfromKavach.Description
	spaceObjectforDega.ApplicationID = spaceObjectfromKavach.ApplicationID
	spaceObjectforDega.MetaFields = spaceObjectfromKavach.MetaFields
	spaceSettings := model.SpaceSettings{}
	config.DB.Model(&model.SpaceSettings{}).Where(&model.SpaceSettings{
		SpaceID: spaceObjectforDega.ID,
	}).Preload("Logo").Preload("LogoMobile").Preload("FavIcon").Preload("MobileIcon").First(&spaceSettings)

	spaceObjectforDega.SiteTitle = spaceSettings.SiteTitle
	spaceObjectforDega.TagLine = spaceSettings.TagLine
	spaceObjectforDega.SiteAddress = spaceSettings.SiteAddress
	if spaceSettings.LogoID != nil {
		spaceObjectforDega.LogoID = spaceSettings.LogoID
		spaceObjectforDega.Logo = spaceSettings.Logo
	}
	if spaceSettings.FavIconID != nil {
		spaceObjectforDega.FavIconID = spaceSettings.FavIconID
		spaceObjectforDega.FavIcon = spaceSettings.FavIcon
	}
	if spaceSettings.LogoMobileID != nil {
		spaceObjectforDega.LogoMobileID = spaceSettings.LogoMobileID
		spaceObjectforDega.LogoMobile = spaceSettings.LogoMobile
	}

	if spaceSettings.MobileIconID != nil {
		spaceObjectforDega.MobileIconID = spaceSettings.MobileIconID
		spaceObjectforDega.MobileIcon = spaceSettings.MobileIcon
	}
	spaceObjectforDega.VerificationCodes = spaceSettings.VerificationCodes
	spaceObjectforDega.SocialMediaURLs = spaceSettings.SocialMediaURLs
	spaceObjectforDega.ContactInfo = spaceSettings.ContactInfo
	spaceObjectforDega.Analytics = spaceSettings.Analytics
	spaceObjectforDega.HeaderCode = spaceSettings.HeaderCode
	spaceObjectforDega.FooterCode = spaceSettings.FooterCode
	return &spaceObjectforDega, nil
}
