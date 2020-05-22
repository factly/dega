package format

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/go-chi/chi"
)

// details - Get format by id
// @Summary Show a format by id
// @Description Get format by ID
// @Tags Format
// @ID get-format-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param format_id path string true "Format ID"
// @Success 200 {object} model.Format
// @Router /core/formats/{format_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	formatID := chi.URLParam(r, "format_id")
	id, err := strconv.Atoi(formatID)
	if err != nil {
		return
	}

	result := &model.Format{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Format{}).First(&result).Error

	if err != nil {
		return
	}

	render.JSON(w, http.StatusOK, result)
}
