package factcheck

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// delete - Delete factcheck by id
// @Summary Delete a factcheck
// @Description Delete factcheck by ID
// @Tags Factcheck
// @ID delete-factcheck-by-id
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param factcheck_id path string true "Factcheck ID"
// @Success 200
// @Router /{space_id}/factcheck/factchecks/{factcheck_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	factcheckID := chi.URLParam(r, "factcheck_id")
	id, err := strconv.Atoi(factcheckID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	result := &model.Factcheck{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Factcheck{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	// delete all tags related to factcheck
	config.DB.Where(&model.FactcheckTag{
		FactcheckID: uint(id),
	}).Delete(model.FactcheckTag{})

	// delete all categories related to factcheck
	config.DB.Where(&model.FactcheckCategory{
		FactcheckID: uint(id),
	}).Delete(model.FactcheckCategory{})

	// delete all claims related to factcheck
	config.DB.Where(&model.FactcheckClaim{
		FactcheckID: uint(id),
	}).Delete(model.FactcheckClaim{})

	config.DB.Model(&model.Factcheck{}).Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
