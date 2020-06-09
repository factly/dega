package format

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// update - Update format by id
// @Summary Update a format by id
// @Description Update format by ID
// @Tags Format
// @ID update-format-by-id
// @Produce json
// @Consume json
// @Param X-User header string true "User ID"
// @Param format_id path string true "Format ID"
// @Param X-Space header string true "Space ID"
// @Param Format body format false "Format"
// @Success 200 {object} model.Format
// @Router /core/formats/{format_id} [put]
func update(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		return
	}

	formatID := chi.URLParam(r, "format_id")
	id, err := strconv.Atoi(formatID)

	if err != nil {
		return
	}

	format := &format{}
	json.NewDecoder(r.Body).Decode(&format)
	result := &model.Format{}
	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Format{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	config.DB.Model(&result).Updates(model.Format{
		Name:        format.Name,
		Slug:        format.Slug,
		Description: format.Description,
	}).First(&result)

	render.JSON(w, http.StatusOK, result)
}
