package models

import (
	"encoding/json"
	"net/url"
	"strings"
	"time"

	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

// Medium model
type Medium struct {
	ID          uint            `gorm:"primary_key" json:"id"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	DeletedAt   *gorm.DeletedAt `sql:"index" json:"deleted_at"`
	Name        string          `gorm:"column:name" json:"name"`
	Slug        string          `gorm:"column:slug" json:"slug"`
	Type        string          `gorm:"column:type" json:"type"`
	Title       string          `gorm:"column:title" json:"title"`
	Description string          `gorm:"column:description" json:"description"`
	Caption     string          `gorm:"column:caption" json:"caption"`
	AltText     string          `gorm:"column:alt_text" json:"alt_text"`
	FileSize    int64           `gorm:"column:file_size" json:"file_size"`
	URL         postgres.Jsonb  `gorm:"column:url" json:"url"`
	Dimensions  string          `gorm:"column:dimensions" json:"dimensions"`
	MetaFields  postgres.Jsonb  `gorm:"column:meta_fields" json:"meta_fields"`
	SpaceID     uint            `gorm:"column:space_id" json:"space_id"`
}

// AfterFind hook
func (media *Medium) AfterFind(tx *gorm.DB) (err error) {
	resurl := map[string]interface{}{}
	if viper.IsSet("imageproxy_url") && media.URL.RawMessage != nil {
		_ = json.Unmarshal(media.URL.RawMessage, &resurl)
		if rawURL, found := resurl["raw"]; found {
			urlObj, _ := url.Parse(rawURL.(string))
			resurl["proxy"] = strings.Replace(viper.GetString("imageproxy_url")+urlObj.Path, "/dega.factly.in", "", 1)

			rawBArr, _ := json.Marshal(resurl)
			media.URL = postgres.Jsonb{
				RawMessage: rawBArr,
			}
		}
	}
	return nil
}
