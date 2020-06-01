package medium

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/core/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// details - Get medium by id
// @Summary Show a medium by id
// @Description Get medium by ID
// @Tags Medium
// @ID get-medium-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param medium_id path string true "Medium ID"
// @Param space_id path string true "Space ID"
// @Success 200 {object} model.Medium
// @Router /{space_id}/core/media/{medium_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	mediumID := chi.URLParam(r, "medium_id")
	id, err := strconv.Atoi(mediumID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	if err != nil {
		validation.InvalidID(w, r)
		return
	}

	result := &model.Medium{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Medium{}).Where(&model.Medium{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	render.JSON(w, http.StatusOK, result)
}
