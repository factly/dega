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

// delete - Delete rating by id
// @Summary Delete a rating
// @Description Delete rating by ID
// @Tags Rating
// @ID delete-rating-by-id
// @Param X-User header string true "User ID"
// @Param X-Space header string true "Space ID"
// @Param rating_id path string true "Rating ID"
// @Success 200
// @Router /factcheck/ratings/{rating_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	sID, err := util.GetSpace(r.Context())
	if err != nil {
		errors.Parser(w, r, errors.InternalServerError, 500)
		return
	}

	ratingID := chi.URLParam(r, "rating_id")
	id, err := strconv.Atoi(ratingID)

	if err != nil {
		errors.Parser(w, r, errors.InvalidID, 404)
		return
	}

	result := &model.Rating{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Model(&model.Rating{}).Where(&model.Rating{
		SpaceID: uint(sID),
	}).First(&result).Error

	if err != nil {
		errors.Parser(w, r, err.Error(), 404)
		return
	}

	config.DB.Model(&model.Rating{}).Delete(&result)

	renderx.JSON(w, http.StatusOK, nil)
}
