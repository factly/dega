package format

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/validation"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// details - Get format by id
// @Summary Show a format by id
// @Description Get format by ID
// @Tags Format
// @ID get-format-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param format_id path string true "Format ID"
// @Success 200 {object} model.Format
// @Router /core/formats/{format_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		return
	}

	formatID := chi.URLParam(r, "format_id")
	id, err := strconv.Atoi(formatID)

	if err != nil {
		validation.InvalidID(w, r)
		return
	}

	result := &model.Format{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Format{}).Where(&model.Format{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
