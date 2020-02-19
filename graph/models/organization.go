package models

import (
	"time"
)

type Organization struct {
	ID                 string       `bson:"_id"`
	Name               string       `bson:"name"`
	SiteTitle          string       `bson:"site_title"`
	TagLine            string       `bson:"tag_line"`
	ClientID           string       `bson:"client_id"`
	Slug               string       `bson:"slug"`
	Email              string       `bson:"email"`
	CreatedDate        time.Time    `bson:"created_date"`
	LastUpdatedDate    time.Time    `bson:"last_updated_date"`
	SiteAddress        string       `bson:"site_address"`
	EnableFactchecking bool         `bson:"enable_factchecking"`
	MediaLogo          *DatabaseRef `bson:"mediaLogo"`
	MediaMobileLogo    *DatabaseRef `bson:"mediaMobileLogo"`
	MediaFavicon       *DatabaseRef `bson:"mediaFavicon"`
	MediaMobileIcon    *DatabaseRef `bson:"mediaMobileIcon"`
	Class              string       `bson:"_class"`
}
