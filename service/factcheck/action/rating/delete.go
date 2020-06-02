package rating

import (
	"net/http"
	"strconv"

	"github.com/factly/dega-server/config"
	"github.com/factly/dega-server/service/factcheck/model"
	"github.com/factly/dega-server/util/render"
	"github.com/factly/dega-server/validation"
	"github.com/go-chi/chi"
)

// delete - Delete rating by id
// @Summary Delete a rating
// @Description Delete rating by ID
// @Tags Rating
// @ID delete-rating-by-id
// @Param X-User header string true "User ID"
// @Param space_id path string true "Space ID"
// @Param rating_id path string true "Rating ID"
// @Success 200
// @Router /{space_id}/factcheck/ratings/{rating_id} [delete]
func delete(w http.ResponseWriter, r *http.Request) {

	ratingID := chi.URLParam(r, "rating_id")
	id, err := strconv.Atoi(ratingID)

	spaceID := chi.URLParam(r, "space_id")
	sid, err := strconv.Atoi(spaceID)

	result := &model.Rating{}

	result.ID = uint(id)

	// check record exists or not
	err = config.DB.Model(&model.Rating{}).Where(&model.Rating{
		SpaceID: uint(sid),
	}).First(&result).Error

	if err != nil {
		validation.RecordNotFound(w, r)
		return
	}

	config.DB.Model(&model.Rating{}).Delete(&result)

	render.JSON(w, http.StatusOK, nil)
}
