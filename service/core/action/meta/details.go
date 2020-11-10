package meta

import (
	"encoding/json"
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
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Success 200 {object} metadata
// @Router /meta [get]
func details(w http.ResponseWriter, r *http.Request) {
	url := r.URL.Query().Get("url")
	if url == "" {
		errorx.Render(w, errorx.Parser(errorx.Message{
			Code:    http.StatusBadRequest,
			Message: "please pass url query parameter",
		}))
		return
	}

	response, err := http.Get(viper.GetString("iframely_url") + "/oembed?url=" + url)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
		return
	}

	defer response.Body.Close()

	result := metadata{}
	result.Success = 0

	if response.StatusCode != http.StatusOK {
		renderx.JSON(w, http.StatusOK, result)
	}

	var iframelyres iFramelyRes
	err = json.NewDecoder(response.Body).Decode(&iframelyres)
	if err != nil {
		loggerx.Error(err)
		errorx.Render(w, errorx.Parser(errorx.InternalServerError()))
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
