package format

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// delete - Delete format by id
// @Summary Delete a format
// @Description Delete format by ID
// @Tags Format
// @ID delete-format-by-id
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param format_id path string true "Format ID"
// @Success 200
// @Router /{space_id}/core/formats/{format_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	formatID := chi.URLParam(r, "format_id")
	id, err := strconv.Atoi(formatID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	if err != nil {
		validation.InvalidID(w, r)
		return
	}

	result := &model.Format{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Format{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	config.DB.Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
