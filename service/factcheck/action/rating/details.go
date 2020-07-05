package rating

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

// details - Get rating by id
// @Summary Show a rating by id
// @Description Get rating by ID
// @Tags Rating
// @ID get-rating-by-id
// @Produce  json
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param rating_id path string true "Claimant ID"
// @Success 200 {object} model.Claimant
// @Router /factcheck/ratings/{rating_id} [get]
func details(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Parser(w, errors.InternalServerError, 500)
		return
	}

	ratingID := chi.URLParam(r, "rating_id")
	id, err := strconv.Atoi(ratingID)

	if err != nil {
		errors.Parser(w, errors.InvalidID, 404)
		return
	}

	result := &model.Rating{}

	result.ID = uint(id)

	err = config.DB.Model(&model.Rating{}).Preload("Medium").Where(&model.Rating{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errors.Parser(w, err.Error(), 404)
		return
	}

	renderx.JSON(w, http.StatusOK, result)
}
