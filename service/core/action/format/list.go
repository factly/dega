package format

import (
	"net/http"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
)

// list - Get all formats
// @Summary Show all formats
// @Description Get all formats
// @Tags Format
// @ID get-all-formats
// @Produce  json
// @Param X-User header string true "User ID"
// @Success 200 {array} model.Format
// @Router /core/formats [get]
func list(w http.ResponseWriter, r *http.Request) {

	result := []model.Format{}

	err := config.DB.Model(&model.Format{}).Find(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
