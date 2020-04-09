package models

import (
	"time"
)

// Organization model
type Organization struct {
	ID                      string       `bson:"_id"`
	Name                    string       `bson:"name"`
	SiteTitle               string       `bson:"site_title"`
	TagLine                 string       `bson:"tag_line"`
	ClientID                string       `bson:"client_id"`
	Slug                    string       `bson:"slug"`
	Email                   string       `bson:"email"`
	CreatedDate             time.Time    `bson:"created_date"`
	LastUpdatedDate         time.Time    `bson:"last_updated_date"`
	SiteAddress             string       `bson:"site_address"`
	Description             *string      `bson:"description"`
	BaiduVerificationCode   *string      `bson:"baidu_verification_code"`
	BingVerificationCode    *string      `bson:"bing_verification_code"`
	GoogleVerificationCode  *string      `bson:"google_verification_code"`
	YandexVerificationCode  *string      `bson:"yandex_verification_code"`
	FacebookURL             *string      `bson:"facebook_url"`
	TwitterURL              *string      `bson:"twitter_url"`
	InstagramURL            *string      `bson:"instagram_url"`
	LinkedInURL             *string      `bson:"linked_in_url"`
	PinterestURL            *string      `bson:"pinterest_url"`
	YouTubeURL              *string      `bson:"youTube_url"`
	GithubURL               *string      `bson:"github_url"`
	FacebookPageAccessToken *string      `bson:"facebook_page_access_token"`
	GaTrackingCode          *string      `bson:"ga_tracking_code"`
	SiteLanguage            *string      `bson:"site_language"`
	TimeZone                *string      `bson:"time_zone"`
	EnableFactchecking      bool         `bson:"enable_factchecking"`
	MediaLogo               *DatabaseRef `bson:"mediaLogo"`
	MediaMobileLogo         *DatabaseRef `bson:"mediaMobileLogo"`
	MediaFavicon            *DatabaseRef `bson:"mediaFavicon"`
	MediaMobileIcon         *DatabaseRef `bson:"mediaMobileIcon"`
	Class                   string       `bson:"_class"`
}
