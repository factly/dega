package meta

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/factly/x/errorx"
	"github.com/factly/x/loggerx"
	"github.com/factly/x/renderx"
	"github.com/spf13/viper"
)

// details - Get meta info
// @Summary Get meta info
// @Description Get meta info
// @Tags Meta
// @ID get-meta-info
// @Produce  json
// @Param url query string true "URL"
// @Param type query string true "Type"
// @Success 200 {object} metadata
// @Router /meta [get]
func details(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	if url == "" {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("please pass url query parameter", http.StatusBadRequest)))
		return
	}

	metaType := r.URL.Query().Get("type")

	var path string
	if metaType == "oembed" || metaType == "link" {
		path = fmt.Sprintf("/oembed?url=%s&omit_script=1", url)
	} else if metaType == "iframely" {
		path = fmt.Sprintf("/iframely?url=%s&omit_script=1", url)
	} else {
		errorx.Render(w, errorx.Parser(errorx.GetMessage("please pass valid type query parameter", http.StatusBadRequest)))
		return
	}

	res, err := http.Get(viper.GetString("iframely_url") + path)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	if metaType == "iframely" || metaType == "oembed" {
		var result map[string]interface{}
		err = json.NewDecoder(res.Body).Decode(&result)
		if err != nil {
			loggerx.Error(err)
			errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
			return
		}
		renderx.JSON(w, http.StatusOK, result)
	} else if metaType == "link" {
		result := metadata{}
		result.Success = 0

		var iframelyres iFramelyRes
		err = json.NewDecoder(res.Body).Decode(&iframelyres)
		if err != nil {
			renderx.JSON(w, http.StatusOK, result)
			return
		}

		result.Meta.Title = iframelyres.Title
		result.Meta.SiteName = iframelyres.ProviderName
		result.Meta.Image = map[string]interface{}{
			"url": iframelyres.ThumbnailURL,
		}
		result.Meta.Description = iframelyres.Description
		result.Success = 1
		renderx.JSON(w, http.StatusOK, result)
	}
}
