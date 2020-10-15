package medium

import (
	"encoding/json"
	"net/url"

	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/go-chi/chi"
	"github.com/jinzhu/gorm/dialects/postgres"
	"github.com/spf13/viper"
)

// medium model
type medium struct {
	Name        string         `json:"name" validate:"required"`
	Slug        string         `json:"slug"`
	Type        string         `json:"type" validate:"required"`
	Title       string         `json:"title" validate:"required"`
	Description string         `json:"description"`
	Caption     string         `json:"caption"`
	AltText     string         `json:"alt_text"`
	FileSize    int64          `json:"file_size" validate:"required"`
	URL         postgres.Jsonb `json:"url"`
	Dimensions  string         `json:"dimensions" validate:"required"`
}

// Router - Group of medium router
func Router() chi.Router {
	r := chi.NewRouter()

	entity := "media"

	r.With(util.CheckKetoPolicy(entity, "get")).Get("/", list)
	r.With(util.CheckKetoPolicy(entity, "create")).Post("/", create)

	r.Route("/{medium_id}", func(r chi.Router) {
		r.With(util.CheckKetoPolicy(entity, "get")).Get("/", details)
		r.With(util.CheckKetoPolicy(entity, "update")).Put("/", update)
		r.With(util.CheckKetoPolicy(entity, "delete")).Delete("/", delete)
	})

	return r

}

func addProxyURL(medium *model.Medium) error {
	resurl := map[string]interface{}{}
	if viper.IsSet("imageproxy.url") {
		err := json.Unmarshal(medium.URL.RawMessage, &resurl)
		if err != nil {
			return err
		}
		rawURL := resurl["raw"].(string)
		urlObj, err := url.Parse(rawURL)
		if err != nil {
			return err
		}
		resurl["proxy"] = viper.GetString("imageproxy.url") + urlObj.Path

		rawBArr, _ := json.Marshal(resurl)
		medium.URL = postgres.Jsonb{
			RawMessage: rawBArr,
		}
	}
	return nil
}
