package claimant

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

// details - Get claimant by id
// @Summary Show a claimant by id
// @Description Get claimant by ID
// @Tags Claimant
// @ID get-claimant-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param claimant_id path string true "Claimant ID"
// @Success 200 {object} model.Claimant
// @Router /factcheck/claimants/{claimant_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Parser(w, r, errors.InternalServerError, 500)
		return
	}

	claimantID := chi.URLParam(r, "claimant_id")
	id, err := strconv.Atoi(claimantID)

	if err != nil {
		errors.Parser(w, r, errors.InvalidID, 404)
		return
	}

	result := &model.Claimant{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Claimant{}).Preload("Medium").Where(&model.Claimant{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errors.Parser(w, r, err.Error(), 404)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
