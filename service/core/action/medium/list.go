package medium

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

// list - Get all media
// @Summary Show all media
// @Description Get all media
// @Tags Medium
// @ID get-all-media
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} model.Medium
// @Router /core/media [get]
func list(w http.ResponseWriter, r *http.Request) {

	var media []model.Medium

	err := config.DB.Model(&model.Medium{}).Find(&media).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, media)
}
