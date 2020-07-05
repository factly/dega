package factcheck

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/errors"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util"
	"github.com/factly/x/renderx"
	"github.com/go-chi/chi"
)

// delete - Delete factcheck by id
// @Summary Delete a factcheck
// @Description Delete factcheck by ID
// @Tags Factcheck
// @ID delete-factcheck-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param factcheck_id path string true "Factcheck ID"
// @Success 200
// @Router /factcheck/factchecks/{factcheck_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Parser(w, errors.InternalServerError, 500)
		return
	}

	factcheckID := chi.URLParam(r, "factcheck_id")
	id, err := strconv.Atoi(factcheckID)

	if err != nil {
		errors.Parser(w, errors.InvalidID, 404)
		return
	}

	result := &model.Factcheck{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Where(&model.Factcheck{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errors.Parser(w, err.Error(), 404)
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

	renderx.JSON(w, http.StatusOK, nil)
}
